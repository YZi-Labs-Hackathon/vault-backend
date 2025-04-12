import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CommonService } from '@app/modules/shared/common/common.service';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Not, Repository } from 'typeorm';
import moment from 'moment';
import { VaultDepositor } from '@app/modules/vault/entities/vault-depositor.entity';
import { UserVaultData } from '@app/modules/auth/auth.types';
import { VaultWithdrawDto } from '@app/modules/vault/dto/vault-withdraw.dto';
import { VaultTransactionService } from '@app/modules/vault/services/vault-transaction.service';
import { CustomException } from '@app/common/errors';
import { VaultService } from '@app/modules/vault/services/vault.service';
import { VAULT_STATUS, VAULT_TRANSACTION_STATUS, VAULT_TRANSACTION_TYPE } from '@app/modules/vault/vault.constants';
import { TokenService } from '@app/modules/token/services/token.service';
import { ethers, formatUnits } from 'ethers';
import {
    CreateVaultDepositorDto,
    CreateVaultTransactionDto,
    FilterVaultDto,
    VaultDepositDto,
    VaultWithdrawSignatureDto,
} from '@app/modules/vault/dto';
import { VaultTransaction } from '@app/modules/vault/entities/vault-transaction.entity';
import { FilterVaultTransactionDto } from '@app/modules/vault/dto/filter-vault-transaction.dto';
import { DepositToVaultDto, QueryPaginateDto, VenusWithdrawDto } from '@app/modules/shared/dto';
import { IUserVaultPayload } from '@app/modules/user/user.type';
import { FilterDepositorDto } from '@app/modules/vault/dto/filter-depositor.dto';
import { Vault } from '@app/modules/vault/entities/vault.entity';
import { ChainService } from '@app/modules/chain/services/chain.service';
import { v4 as uuid } from 'uuid';
import { VaultContractService } from '@app/modules/vault/services/contracts/vault-contract.service';
import { User } from '@app/modules/user/entities/user.entity';
import { UserWithdrawData, VaultDepositData } from '@app/modules/vault/vault.types';
import { UserService } from '@app/modules/user/services/user.service';
import { ProtocolService } from '@app/modules/protocol/services/protocol.service';
import { PROTOCOL_SERVICE } from '@app/modules/protocol/protocol.type';
import { ProtocolFactoryService } from '@app/modules/vault/services/protocols/protocol.factory.service';
import { VaultValidatorService } from '@app/modules/shared/services/vault-validator.service';

@Injectable()
export class VaultDepositorService extends CommonService<VaultDepositor> {
    private readonly VAULT_DEPOSIT_DEADLINE = +process.env.VAULT_DEPOSIT_DEADLINE || 300;
    private readonly VAULT_DEPOSIT_SIGNER = process.env.VAULT_DEPOSIT_SIGNER || '0x';
    private readonly SHARE_TOKEN_DECIMALS = 18;
    private readonly VAULT_FACTORY_EVM_ADDRESS = process.env.VAULT_FACTORY_EVM_ADDRESS || '0x';
    private readonly VAULT_DEADLINE = +process.env.VAULT_DEADLINE || 300;
    private readonly VAULT_SHARE_TOKEN_DECIMALS = +process.env.VAULT_SHARE_TOKEN_DECIMALS || 18;

    constructor(
        @InjectRepository(VaultDepositor) readonly repository: Repository<VaultDepositor>,
        private readonly dataSource: DataSource,
        @Inject(forwardRef(() => VaultTransactionService))
        private readonly vaultTransactionService: VaultTransactionService,
        @Inject(forwardRef(() => VaultService)) private readonly vaultService: VaultService,
        @Inject(forwardRef(() => VaultContractService)) private readonly vaultContractService: VaultContractService,
        private readonly tokenService: TokenService,
        private readonly chainService: ChainService,
        private readonly protocolFactoryService: ProtocolFactoryService,
        private readonly userService: UserService,
        private readonly protocolService: ProtocolService,
        private readonly vaultValidatorService: VaultValidatorService
    ) {
        super(repository);
    }

    async withdrawFromVault(user: UserVaultData, payload: VaultWithdrawDto): Promise<UserWithdrawData> {
        const vault = await this.vaultService.findById(payload.vaultId);
        if (!vault) {
            throw new CustomException('Vault not found', 404);
        } else if (vault.status === VAULT_STATUS.IN_REVIEW) {
            throw new CustomException('Vault is not active', 401);
        }
        const [token, protocol] = await Promise.all([
            this.tokenService.detail(vault.tokenId),
            this.protocolService.detail(vault.defaultProtocolId),
        ]);
        return await this.dataSource.transaction(async (manager) => {
            const depositor = await this.findForUpdate(manager, {
                where: { userId: user.id, vaultId: payload.vaultId },
            });
            if (!depositor) {
                throw new CustomException("You don't have any deposit in this vault", 401);
            }
            if (depositor.lockedWithdrawAt && moment().unix() < depositor.lockedWithdrawAt) {
                throw new CustomException('Your withdraw is locked', 401);
            }

            const chain = await this.chainService.detail(vault.chainId);

            const formattedBalanceCanWithdraw = await this.vaultContractService.userAssets(
                vault.contractAddress,
                user.address,
                chain
            );

            // TODO: Get total amount request withdraw
            const withdrawTxs = await manager.withRepository(this.vaultTransactionService.repository).find({
                where: {
                    userId: user.id,
                    vaultId: payload.vaultId,
                    type: VAULT_TRANSACTION_TYPE.WITHDRAW,
                    status: Not(
                        In([
                            VAULT_TRANSACTION_STATUS.COMPLETED,
                            VAULT_TRANSACTION_STATUS.FAILED,
                            VAULT_TRANSACTION_STATUS.PENDING,
                        ])
                    ),
                },
                lock: { mode: 'pessimistic_read' },
            });
            const totalWithdrawLocked = withdrawTxs.reduce((acc, tx) => BigInt(tx.amount) + BigInt(acc), BigInt(0));
            console.log(`Total withdraw locked: ${totalWithdrawLocked.toString()}`);

            const amountValid = (BigInt(formattedBalanceCanWithdraw) - BigInt(totalWithdrawLocked)).toString();
            const amountWithdraw = ethers.formatUnits(payload.amount, +token.decimals);
            console.log(`Amount valid: ${amountValid}, Amount withdraw: ${amountWithdraw}`);
            if (BigInt(amountValid) < BigInt(payload.amount)) {
                throw new CustomException('Insufficient balance', 401);
            }

            let status = VAULT_TRANSACTION_STATUS.PENDING;
            let metadata: any = {};
            let res = {
                service: protocol.service,
                params: null,
            };
            let txId = `0x` + uuid().replace(/-/g, '');
            let fees: any = undefined;
            let netAmount = payload.amount;
            if (protocol.service === PROTOCOL_SERVICE.APEX) {
                status = VAULT_TRANSACTION_STATUS.AWAITING;
            } else if (protocol.service === PROTOCOL_SERVICE.VENUS) {
            }

            const _payload: VenusWithdrawDto = {
                withdrawId: txId,
                vaultAddress: vault.contractAddress,
                userAddress: user.address,
                amount: payload.amount,
            };
            const getSig = await this.vaultValidatorService.getSignatureWithdraw(_payload);

            const userPnl = await this.getPnlByUser(user.id, vault.id);
            fees = getSig.payload.fees;
            netAmount = getSig.payload.amount;
            metadata = {
                ...metadata,
                userPnl,
                userPrincipalDeposit: depositor.principalAmount,
            };

            const newTx: CreateVaultTransactionDto = {
                amount: payload.amount,
                deadline: moment().unix() + vault.withdrawTerm.delay,
                metadata,
                netAmount,
                status,
                txId,
                type: VAULT_TRANSACTION_TYPE.WITHDRAW,
                userId: user.id,
                vaultId: vault.id,
                fees,
            };
            await this.vaultTransactionService.createWithTransaction(manager, newTx);
            return {
                service: protocol.service,
                signature: getSig?.signature,
                payload: getSig?.payload,
            };
        });
    }

    async getPnlAllTimeUserByVaultId(userId: string, vaultId: string): Promise<string> {
        const currentUserPnl = await this.getPnlByUser(userId, vaultId);
        const pnlWithdrawByUser = await this.vaultTransactionService.getUserPnlWithdrawByVautlId(userId, vaultId);
        console.log(`pnlWithdrawByUser`, pnlWithdrawByUser);
        console.log(`currentUserPnl`, currentUserPnl);

        return (BigInt(currentUserPnl) + BigInt(pnlWithdrawByUser)).toString();
    }

    async getPnlByUser(userId: string, vaultId: string) {
        const user = await this.userService.detail(userId);
        const { userTVL } = await this.getTVLByUser(user.address, vaultId);
        const depositor = await this.getDepositorByUserIdAndVaultId(user.id, vaultId);
        console.log(`userTVL`, userTVL);
        console.log(`principalAmount`, depositor?.principalAmount || 0);

        return (BigInt(userTVL) - BigInt(depositor?.principalAmount || 0)).toString();
    }

    async getDepositorsTransactions(
        filter: FilterVaultTransactionDto,
        paginate: QueryPaginateDto,
        user: IUserVaultPayload
    ) {
        return await this.vaultTransactionService.getDepositorsTransactions(filter, paginate, user);
    }

    async getDepositorsOfVault(vaultId: string, paginate: QueryPaginateDto) {
        let filter: FilterDepositorDto = new FilterDepositorDto();
        let vaultDTO: FilterVaultDto = new FilterVaultDto();
        filter.vaultId = vaultId;
        vaultDTO.vaultId = vaultId;
        const vaultInfoQuery = this.vaultService.getDetailVault(undefined, vaultDTO);
        const vault = await vaultInfoQuery.getOne();
        const query = this.filterQuery(filter);
        const result = await this.paginateQueryBuilder(query, paginate);
        const items = await Promise.all(
            result.items
                .filter((item) => Number(item.amount) > 0)
                .map(async (item) => {
                    const pnlUserAllTime = await this.getPnlAllTimeUserByVaultId(item.userId, item.vaultId);
                    return {
                        ...item,
                        user: item.user,
                        share: undefined,
                        allTimePnl: formatUnits(pnlUserAllTime, +vault.token.decimals),
                        holdDay: moment().diff(moment(item.createdAt), 'days'),
                    };
                })
        );
        return { items: items, meta: result.meta };
    }

    async getWithdrawState(vaultId: string, user: IUserVaultPayload) {
        const query = this.filterQuery({ vaultId, userId: user.id });
        const result = await this.findOneQueryBuilder(query);
        if (!result) {
            return {
                amount: 0,
                lockedAmount: 0,
                lockedWithdrawAt: 0,
            };
        }
        let amount = '0';
        let totalWithdrawLocked = BigInt(0);
        const [withdrawTxs, vault] = await Promise.all([
            this.vaultTransactionService.findAll({
                where: {
                    userId: user.id,
                    vaultId: vaultId,
                    type: VAULT_TRANSACTION_TYPE.WITHDRAW,
                    status: Not(
                        In([
                            VAULT_TRANSACTION_STATUS.COMPLETED,
                            VAULT_TRANSACTION_STATUS.FAILED,
                            VAULT_TRANSACTION_STATUS.PENDING,
                        ])
                    ),
                },
            }),
            this.vaultService.findById(vaultId),
        ]);
        const [chain] = await Promise.all([this.chainService.detail(vault.chainId)]);
        totalWithdrawLocked = withdrawTxs.reduce((acc, tx) => BigInt(tx.amount) + BigInt(acc), BigInt(0));
        console.log(`Total withdraw locked: ${totalWithdrawLocked.toString()}`);

        const formattedBalanceCanWithdraw = await this.vaultContractService.userAssets(
            vault.contractAddress,
            user.address,
            chain
        );

        console.log(`formattedBalanceCanWithdraw`, formattedBalanceCanWithdraw);
        console.log(`totalWithdrawLocked`, totalWithdrawLocked);

        const subAmount = BigInt(formattedBalanceCanWithdraw) - BigInt(totalWithdrawLocked);
        console.log(`Sub amount: ${subAmount.toString()}`);
        if (result.lockedWithdrawAt && result.lockedWithdrawAt > moment().unix()) {
            amount = '0';
            totalWithdrawLocked = BigInt(formattedBalanceCanWithdraw);
        } else {
            if (subAmount < 0) {
                amount = '0';
            } else {
                amount = subAmount.toString();
            }
        }
        return {
            amount: amount.toString(),
            lockedAmount: totalWithdrawLocked.toString(),
            lockedWithdrawAt: result.lockedWithdrawAt,
        };
    }

    async getAmountAvailableToWithdrawByUser(vaultId: string, userId: string) {
        const query = this.filterQuery({ vaultId, userId: userId });
        const result = await this.findOneQueryBuilder(query);
        console.log(`Result: `, result);
        if (!result) {
            console.log('aaa');
            return '0';
        }
        const [withdrawTxs, vault, user] = await Promise.all([
            this.vaultTransactionService.findAll({
                where: {
                    userId,
                    vaultId: vaultId,
                    type: VAULT_TRANSACTION_TYPE.WITHDRAW,
                    status: Not(In([VAULT_TRANSACTION_STATUS.COMPLETED, VAULT_TRANSACTION_STATUS.FAILED])),
                },
            }),
            this.vaultService.findById(vaultId),
            this.userService.findById(userId),
        ]);
        const [chain, token] = await Promise.all([
            this.chainService.detail(vault.chainId),
            this.tokenService.detail(vault.tokenId),
        ]);

        let totalWithdrawLocked = withdrawTxs.reduce((acc, tx) => BigInt(tx.amount) + BigInt(acc), BigInt(0));
        let amountAvailable = '0';

        if (result.lockedWithdrawAt && result.lockedWithdrawAt > moment().unix()) {
            return amountAvailable;
        } else {
            const formattedBalanceCanWithdraw = await this.vaultContractService.userAssets(
                vault.contractAddress,
                user.address,
                chain
            );
            const subAmount = BigInt(formattedBalanceCanWithdraw) - BigInt(totalWithdrawLocked);

            if (subAmount < 0) {
                amountAvailable = '0';
            } else {
                amountAvailable = subAmount.toString();
            }
        }
        return amountAvailable;
    }

    async getTotalBalanceDeposit(vaultId: string): Promise<number> {
        const query = this.repository.createQueryBuilder('vault');
        query.select(`SUM(CAST(amount AS NUMERIC))`, 'total');
        query.where('vault_id = :vaultId', { vaultId });
        const result = await query.getRawOne();
        return result.total || 0;
    }

    async addDepositInit(manager: EntityManager, vault: Vault, depositorId: string, amount: string) {
        const newDepositor: CreateVaultDepositorDto = {
            amount,
            principalAmount: amount,
            lockedAmount: amount,
            // lockedWithdrawAt: moment().unix() + vault.withdrawTerm.lockUpPeriod,
            share: '0',
            userId: depositorId,
            vaultId: vault.id,
        };
        return await this.createWithTransaction(manager, newDepositor);
    }

    async addDeposit(manager: EntityManager, vault: Vault, user: User, transaction: VaultTransaction) {
        const depositor = await this.findForUpdate(manager, {
            where: {
                vaultId: vault.id,
                userId: user.id,
            },
        });
        let lockedWithdrawAt = null;
        if (vault.withdrawTerm.lockUpPeriod) {
            lockedWithdrawAt = moment().unix() + vault.withdrawTerm.lockUpPeriod;
        }
        if (!depositor) {
            const newDepositorVault: CreateVaultDepositorDto = {
                share: transaction.share,
                userId: transaction.userId,
                vaultId: transaction.vaultId,
                amount: transaction.amount,
                principalAmount: transaction.amount,
                lockedWithdrawAt,
            };
            await this.createWithTransaction(manager, newDepositorVault);
        } else {
            depositor.amount = (BigInt(depositor.amount) + BigInt(transaction.amount)).toString();
            depositor.principalAmount = (BigInt(depositor.principalAmount) + BigInt(transaction.amount)).toString();
            depositor.lockedWithdrawAt = lockedWithdrawAt;
            await this.saveWithTransaction(manager, depositor);
        }
        return true;
    }

    async getDepositorByUserIdAndVaultId(userId: string, vaultId: string) {
        return await this.findOne({
            where: {
                userId: userId,
                vaultId: vaultId,
            },
        });
    }

    async getTotalDepositByVaultId(vaultId: string): Promise<string> {
        const depositors = await this.findAll({
            where: {
                vaultId: vaultId,
            },
        });
        return depositors
            .reduce((acc, depositor) => BigInt(acc) + BigInt(depositor.principalAmount || 0), BigInt(0))
            .toString();
    }

    async getUserDepositByVault(userId: string, vaultId: string): Promise<VaultDepositor[]> {
        return await this.findAll({
            where: {
                vaultId: vaultId,
                userId: userId,
            },
        });
    }

    async updateSignatureWithdraw(user: UserVaultData, txId: string, payload: VaultWithdrawSignatureDto) {
        return this.vaultTransactionService.updateSignatureWithdraw(user, txId, payload);
    }

    async getTVLByUser(userAddress: string, vaultId: string) {
        const vault = await this.vaultService.findById(vaultId);

        const [chain, token] = await Promise.all([
            this.chainService.detail(vault.chainId),
            this.tokenService.detail(vault.tokenId),
        ]);

        const userTVL = await this.vaultContractService.userAssets(vault.contractAddress, userAddress, chain);
        console.log(`userTVL`, userTVL);

        return {
            vault,
            chain,
            token,
            userTVL,
        };
    }

    async depositToVault(user: UserVaultData, payload: VaultDepositDto): Promise<VaultDepositData> {
        const vault = await this.vaultService.findById(payload.vaultId);
        if (!vault) {
            throw new CustomException('Vault not found', 404);
        } else if (vault.status === VAULT_STATUS.IN_REVIEW) {
            throw new CustomException('Vault is not active', 401);
        }
        const [chain, token] = await Promise.all([
            this.chainService.detail(vault.chainId),
            this.tokenService.detail(vault.tokenId),
        ]);

        vault.validDepositRule(payload.amount, +token.decimals, user.address);
        const txId = `0x` + uuid().replace(/-/g, '');
        const transactionDepositDto: CreateVaultTransactionDto = {
            userId: user.id,
            vaultId: payload.vaultId,
            type: VAULT_TRANSACTION_TYPE.DEPOSIT,
            amount: payload.amount,
            status: VAULT_TRANSACTION_STATUS.PENDING,
            txId,
        };
        await this.vaultTransactionService.addTransaction(transactionDepositDto);

        const _payload: DepositToVaultDto = {
            depositId: txId,
            amount: payload.amount,
            chainId: chain.chainId,
            user: user.address,
            vaultAddress: vault.contractAddress,
        };
        const res = await this.vaultValidatorService.depositVault(_payload);
        return {
            vaultParam: res.vaultParam,
            signature: res.signature,
        };
    }

    private filterQuery(filter?: FilterDepositorDto) {
        const query = this.repository
            .createQueryBuilder('vaultDepositor')
            .leftJoinAndSelect('vaultDepositor.vault', 'vault')
            .leftJoinAndSelect('vaultDepositor.user', 'user')
            .orderBy('CAST(vaultDepositor.amount AS DECIMAL)', 'DESC');

        if (filter?.vaultId) {
            query.andWhere('vaultDepositor.vaultId = :vaultId', { vaultId: filter.vaultId });
        }
        if (filter?.userId) {
            query.andWhere('vaultDepositor.userId = :userId', { userId: filter.userId });
        }

        return query;
    }

    async syncDeposit(manager: EntityManager, vault: Vault, transaction: VaultTransaction) {
        const depositor = await this.findForUpdate(manager, {
            where: {
                vaultId: vault.id,
                userId: transaction.userId,
            },
        });
        let lockedWithdrawAt = null;
        if (vault.withdrawTerm.lockUpPeriod) {
            lockedWithdrawAt = moment().unix() + vault.withdrawTerm.lockUpPeriod;
        }

        if (!depositor) {
            const newDepositorVault: CreateVaultDepositorDto = {
                share: transaction.share,
                userId: transaction.userId,
                vaultId: transaction.vaultId,
                amount: transaction.amount,
                principalAmount: transaction.amount,
                lockedWithdrawAt,
            };
            await this.createWithTransaction(manager, newDepositorVault);
        } else {
            depositor.amount = (BigInt(depositor.amount) + BigInt(transaction.amount)).toString();
            depositor.principalAmount = (BigInt(depositor.principalAmount) + BigInt(transaction.amount)).toString();
            depositor.lockedWithdrawAt = lockedWithdrawAt;
            await this.saveWithTransaction(manager, depositor);
        }
        return true;
    }
}

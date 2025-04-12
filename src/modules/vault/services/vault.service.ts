import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CommonService } from '@app/modules/shared/common/common.service';
import { Vault } from '@app/modules/vault/entities/vault.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Not, Repository } from 'typeorm';
import { IUserVaultPayload } from '@app/modules/user/user.type';
import { CustomException } from '@app/common/errors';
import {
    VAULT_PROCESSOR,
    VAULT_PROTOCOL_STATUS,
    VAULT_STATUS,
    VAULT_TRANSACTION_STATUS,
    VAULT_TRANSACTION_TYPE,
} from '@app/modules/vault/vault.constants';
import { VaultTransactionService } from '@app/modules/vault/services/vault-transaction.service';
import { VaultActionService } from '@app/modules/vault/services/vault-action.service';
import { ProtocolFactoryService } from '@app/modules/vault/services/protocols/protocol.factory.service';
import { ACTION_COMMAND } from '@app/modules/protocol/protocol.constants';
import { Chain } from '@app/modules/chain/entities/chain.entity';
import { ChainType } from '@app/common/types';
import { GetSignatureCreateVaultDto, QueryPaginateDto, RequestWithdrawDto } from '@app/modules/shared/dto';
import moment from 'moment/moment';
import { CreateVaultActionDto, CreateVaultDto, FilterVaultDto, VaultDepositor } from '@app/modules/vault/dto';
import { UserService } from '@app/modules/user/services/user.service';
import { VaultDepositorService } from '@app/modules/vault/services/vault-depositor.service';
import { ChainService } from '@app/modules/chain/services/chain.service';
import { TokenService } from '@app/modules/token/services/token.service';
import { CreateVaultData } from '@app/modules/vault/vault.types';
import { VaultContractService } from '@app/modules/vault/services/contracts/vault-contract.service';
import { ProtocolService } from '@app/modules/protocol/services/protocol.service';
import { PROTOCOL_SERVICE } from '@app/modules/protocol/protocol.type';
import { FilterVaultProtocolDto } from '@app/modules/vault/dto/filter-vault-protocol.dto';
import { VaultProtocolService } from '@app/modules/vault/services/vault-protocol.service';
import { plainToInstance } from 'class-transformer';
import { VaultActivityService } from '@app/modules/vault/services/vault-activity.service';
import { UserVaultData } from '@app/modules/auth/auth.types';
import { CreatorFilterVaultDto } from '@app/modules/user/dto/creator-filter-vault.dto';
import { CreatorUpdateVaultDto } from '@app/modules/user/dto/creator-update-vault.dto';
import { CreatorCreateVaultActionDto } from '@app/modules/user/dto';
import { ActionService } from '@app/modules/protocol/services/action.service';
import { STATUS } from '@app/modules/shared/shared.constants';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { ethers, formatUnits, parseUnits } from 'ethers';
import { EVMVault__factory } from '@app/types/vault';
import { omit } from 'lodash';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { ChartDataPoint } from '@app/common/utils';
import { uuid } from 'uuidv4';
import { VaultValidatorService } from '@app/modules/shared/services/vault-validator.service';

@Injectable()
export class VaultService extends CommonService<Vault> {
    private readonly VAULT_FACTORY_EVM_ADDRESS = process.env.VAULT_FACTORY_EVM_ADDRESS || '0x';
    private readonly VAULT_DEADLINE = +process.env.VAULT_DEADLINE || 300;
    private readonly VAULT_DEPOSIT_MAX = process.env.VAULT_DEPOSIT_MAX || '1000';
    private readonly VAULT_SHARE_TOKEN_DECIMALS = +process.env.VAULT_SHARE_TOKEN_DECIMALS || 18;
    private readonly VAULT_MIN_DEPOSIT = process.env.VAULT_MIN_DEPOSIT || '0.5';

    constructor(
        @InjectRepository(Vault) readonly repository: Repository<Vault>,
        private readonly userService: UserService,
        private readonly vaultTransactionService: VaultTransactionService,
        private readonly vaultDepositorService: VaultDepositorService,
        private readonly chainService: ChainService,
        private readonly tokenService: TokenService,
        @Inject(forwardRef(() => VaultActionService)) private readonly vaultActionService: VaultActionService,
        private readonly protocolFactoryService: ProtocolFactoryService,
        private readonly dataSource: DataSource,
        @Inject(forwardRef(() => VaultContractService)) private readonly vaultContractService: VaultContractService,
        private readonly vaultValidatorService: VaultValidatorService,
        private readonly protocolService: ProtocolService,
        @Inject(forwardRef(() => VaultProtocolService)) private readonly vaultProtocolService: VaultProtocolService,
        private readonly actionService: ActionService,
        @Inject(forwardRef(() => VaultActivityService)) private readonly vaultActivityService: VaultActivityService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) {
        super(repository);
    }

    async syncPnlWithDraw(vaultId: string) {
        return await this.vaultTransactionService.syncPnlWithDraw(vaultId);
    }

    async createVault(payload: CreateVaultDto): Promise<CreateVaultData> {
        const check = await this.checkVaultExist(payload.name, payload.symbol);
        if (check) {
            throw new CustomException('Vault already exist', HttpStatus.BAD_REQUEST);
        }
        if (payload.fee) {
            if (!payload.fee.recipientAddress) {
                const user = await this.userService.detail(payload.creatorId);
                payload.fee.recipientAddress = user.address;
            }
        }

        const [infoToken, protocol, user] = await Promise.all([
            this.tokenService.detail(payload.tokenId),
            this.protocolService.findById(payload.defaultProtocolId),
            this.userService.detail(payload.creatorId),
        ]);
        if (!infoToken) {
            throw new CustomException('Cannot validate info create value', HttpStatus.BAD_REQUEST);
        }
        const infoChain = await this.chainService.detail(infoToken.chainId);
        if (!infoChain) {
            throw new CustomException('Cannot validate info create value', HttpStatus.BAD_REQUEST);
        }
        let decimal: number = infoToken.decimals;

        const minDeposit = parseUnits(this.VAULT_MIN_DEPOSIT, +decimal).toString();
        console.log(`minDeposit`, minDeposit);
        if (BigInt(payload.depositInit.amountDeposit) < BigInt(minDeposit)) {
            throw new CustomException(
                `The minimum Deposit Initial Capital is $${this.VAULT_MIN_DEPOSIT}`,
                HttpStatus.BAD_REQUEST
            );
        }

        if (!payload.fee) {
            payload.fee = { performanceFee: 5 } as any;
        }
        const deadline = moment().unix() + this.VAULT_DEADLINE;
        let maxDeposit = payload.depositRule?.max.toString();
        let minD = payload.depositRule?.min
            ? parseUnits(payload.depositRule.min.toString(), +infoToken.decimals).toString()
            : parseUnits('1', +infoToken.decimals).toString();
        const res = await this.dataSource.transaction(async (manager) => {
            payload.chainId = infoToken.chainId;
            const newVault = await this.createWithTransaction(manager, payload);
            await this.vaultTransactionService.createWithTransaction(manager, {
                txId: `${newVault.id}_INIT`,
                userId: payload.creatorId,
                status: VAULT_TRANSACTION_STATUS.PENDING,
                vaultId: newVault.id,
                type: VAULT_TRANSACTION_TYPE.DEPOSIT,
                amount: payload.depositInit.amountDeposit,
                deadline,
            });
            if (payload.protocolIds && payload.protocolIds.length) {
                for (const protocolId of payload.protocolIds) {
                    await this.vaultProtocolService.upsertWithTransaction(
                        manager,
                        {
                            vaultId: newVault.id,
                            protocolId,
                            status: VAULT_PROTOCOL_STATUS.ACTIVE,
                        },
                        { conflictPaths: ['vaultId', 'protocolId'] }
                    );
                }
            }
            if (payload.defaultProtocolId) {
                await this.vaultProtocolService.upsertWithTransaction(
                    manager,
                    {
                        vaultId: newVault.id,
                        protocolId: payload.defaultProtocolId,
                        status: VAULT_PROTOCOL_STATUS.ACTIVE,
                    },
                    { conflictPaths: ['vaultId', 'protocolId'] }
                );
            }
            if (maxDeposit) {
                if (maxDeposit == '0') {
                    maxDeposit = ethers.MaxUint256.toString();
                } else {
                    maxDeposit = parseUnits(maxDeposit, +infoToken.decimals).toString();
                }
            } else {
                maxDeposit = ethers.MaxUint256.toString();
            }

            // TODO: Get signature from validator
            const payloadCreateVaultDto: GetSignatureCreateVaultDto = {
                chainId: infoChain.chainId,
                authority: user.address,
                initialAgentDeposit: payload.depositInit.amountDeposit,
                maxDeposit,
                minDeposit: minD,
                protocolHelper: protocol.strategy,
                protocol: protocol.service.toUpperCase(),
                shareTokenName: payload.name,
                shareTokenSymbol: payload.symbol,
                underlying: infoToken.address,
                vaultId: newVault.id,
            };
            const res = await this.vaultValidatorService.createVault(payloadCreateVaultDto);
            console.log(`signature create Vault validator`, res);

            return { signature: res.signature, vaultParam: res.vaultParam, vaultId: newVault.id };
        });

        return {
            signature: res.signature,
            vaultParam: res.vaultParam,
            vaultId: res.vaultId,
        };
    }

    async getPnlTvlUser(payload: { user: IUserVaultPayload }) {
        try {
            const user = await this.userService.repository.findOne({
                where: [{ id: payload.user.id }],
            });
            if (!user) {
                return {
                    tvl: 0,
                    pnl: 0,
                };
            }
            let pnl = 0;
            let tvl = 0;

            const transactionUser = await this.vaultTransactionService.repository.find({
                relations: ['vault'],
                where: { userId: user.id },
            });
            const vaults = new Set(transactionUser.map((transaction) => transaction.vault.id));
            // Get Detail Vault have User
            const vaultDetails = await this.repository.find({
                relations: ['token'],
                where: [
                    {
                        id: In(Array.from(vaults)),
                        status: In([VAULT_STATUS.ACTIVE, VAULT_STATUS.CLOSE, VAULT_STATUS.PAUSE]),
                    },
                ],
            });
            for (const vault of vaultDetails) {
                const userPnl = await this.vaultDepositorService.getPnlAllTimeUserByVaultId(user.id, vault.id);
                const { userTVL } = await this.vaultDepositorService.getTVLByUser(user.address, vault.id);

                tvl += +formatUnits(BigInt(userTVL), +vault.token.decimals);
                pnl += +formatUnits(BigInt(userPnl), +vault.token.decimals);
            }
            return {
                tvl: tvl.toString(),
                pnl: pnl.toString(),
            };
        } catch (error) {
            console.log(`getPnlTvlUser ERROR`, error);
            return {
                tvl: 0,
                pnl: 0,
            };
        }
    }

    async getDetailVaults(user?: IUserVaultPayload, filter?: FilterVaultDto) {
        const query = this.getDetailVault(user, filter);
        const result = await query.getOne();
        if (!result) {
            throw new CustomException('cannot find vault', HttpStatus.BAD_REQUEST);
        }

        const [userPnl24h, totalAsset] = await Promise.all([
            this.vaultTransactionService.getUserPNLLast24h(user?.id, result.id),
            this.vaultContractService.getVaultValue(result.contractAddress),
        ]);

        let yourPnl = '0';
        let depositUser = '0';
        let depositor = undefined;
        let allTimePnl = await this.getPNLAlltime(result);
        if (user) {
            [yourPnl, depositor] = await Promise.all([
                this.vaultDepositorService.getPnlAllTimeUserByVaultId(user.id, result.id),
                this.vaultDepositorService.getDepositorByUserIdAndVaultId(user.id, result.id),
            ]);
            depositUser = depositor?.principalAmount || '0';
        }
        console.log(`totalAsset`, totalAsset, result.token.decimals);
        return {
            ...omit(plainToInstance(Vault, result), ['transactions']),
            totalLock: formatUnits(BigInt(totalAsset), +result.token.decimals).toString(),
            yourDeposit: formatUnits(BigInt(depositUser), +result.token.decimals),
            apy: 0,
            yourPnl: formatUnits(BigInt(yourPnl), +result.token.decimals).toString(),
            allTimePnl: formatUnits(BigInt(allTimePnl ?? '0'), +result.token.decimals).toString(),
            age: moment().diff(moment(result.createdAt), 'days'),
            profitShare: `${100 - Number(result.fee.performanceFee)}`,
            maxDrawDown: 0,
            yourPnl24h: formatUnits(BigInt(userPnl24h ?? '0'), +result.token.decimals).toString(),
        };
    }

    async getLisVault(filterVaultDto: FilterVaultDto, page: QueryPaginateDto, user?: IUserVaultPayload) {
        console.log(`filterVaultDto`, filterVaultDto);
        const query = await this.getListVault(filterVaultDto);
        const vaults = await this.paginateQueryBuilder(query, page);

        return {
            items: await Promise.all(vaults.items.map(async (vault) => this.vaultDetailPayload(vault, user))),
            meta: vaults.meta,
        };
    }

    async getCreatorsVaultsList(filter: CreatorFilterVaultDto, currentUser: IUserVaultPayload) {
        const query = this.filterVaultCreator(filter, currentUser);
        return query.getMany();
    }

    async getProtocolVault(filter: FilterVaultProtocolDto) {
        const query = this.filterQueryAction(filter);
        const result = await query.getOne();
        return result.vaultActions.map((vaultAction) => {
            return vaultAction.protocolAction.protocol;
        });
    }

    filterQueryAction(filter: FilterVaultProtocolDto) {
        const query = this.repository.createQueryBuilder('vault');
        query.leftJoinAndSelect('vault.vaultActions', 'vaultActions');
        query.leftJoinAndSelect('vaultActions.protocolAction', 'protocolAction');
        query.leftJoinAndSelect('protocolAction.protocol', 'protocol');
        if (filter.vaultId) {
            query.andWhere('vault.id =:vaultId', { vaultId: filter.vaultId });
        }
        if (filter.address) {
            query.andWhere('vault.contract_address =:contractAddress', { contractAddress: filter.address });
        }
        return query;
    }

    async getVaultPnl(user: IUserVaultPayload) {
        const mapVault = new Map();
        const query = this.getUserInVault();
        const result = await query.getMany();
        if (!result.length) {
            return {
                tvl: 0,
                pnl: 0,
            };
        }
        const listVault = await this.repository.find({
            relations: ['chain', 'depositors', 'token'],
            where: [{ status: Not(In([VAULT_STATUS.IN_REVIEW])) }],
        });
        let totalAssetSum = 0;
        let weightedAssetSum = 0;
        await Promise.all(
            listVault.map(async (vault) => {
                const totalShare = await this.vaultContractService.getTotalSupply(vault.contractAddress, vault.chain);
                const pnlVaultAlltime = await this.getPNLAlltime(vault);
                const totalDepositVault = await this.vaultDepositorService.getTotalDepositByVaultId(vault.id);
                console.log(`totalShare`, totalShare);
                console.log(`pnlVaultAlltime`, pnlVaultAlltime);
                console.log(`totalDepositVault`, totalDepositVault);
                totalAssetSum += +formatUnits(BigInt(totalShare), +this.VAULT_SHARE_TOKEN_DECIMALS);
                weightedAssetSum += +formatUnits(BigInt(pnlVaultAlltime), +vault.token.decimals);
                console.log(
                    `VAULTXX`,
                    vault.id,
                    +formatUnits(BigInt(totalShare), +this.VAULT_SHARE_TOKEN_DECIMALS),
                    +formatUnits(BigInt(pnlVaultAlltime), +vault.token.decimals)
                );
            })
        );
        return {
            tvl: totalAssetSum,
            pnl: weightedAssetSum,
        };
    }

    async getCreatorsVaultsListPaginate(
        filter: CreatorFilterVaultDto,
        currentUser: IUserVaultPayload,
        paginate: QueryPaginateDto
    ) {
        const query = this.filterVaultCreator(filter, currentUser);
        return await this.paginateQueryBuilder(query, paginate);
    }

    async approveAllWithdrawVaultRequests(vaultId: string, user: IUserVaultPayload) {
        const query = this.filterQueryWithDrawAllVault({
            vaultId: vaultId,
            status: VAULT_TRANSACTION_STATUS.PENDING,
            user: user,
        });
        const allTransactionWithDraw = await query.getOne();
        if (!allTransactionWithDraw.transactions.length) {
            return [];
        }
        const updateStatus = allTransactionWithDraw.transactions.map((transaction) => {
            transaction.status = VAULT_TRANSACTION_STATUS.CONFIRMED;
            return transaction;
        });
        await this.vaultTransactionService.repository.save(updateStatus);
        return updateStatus;
    }

    async approveAllVaultRequests(withdrawId: string, user: IUserVaultPayload) {
        const query = this.filterQueryWithDraw({
            creatorId: user.id,
            idTransaction: withdrawId,
            status: VAULT_TRANSACTION_STATUS.PENDING,
        });
        const transactionWithDraw = await query.getOne();
        if (!transactionWithDraw) {
            transactionWithDraw.status = VAULT_TRANSACTION_STATUS.CONFIRMED;
            await this.vaultTransactionService.repository.save(transactionWithDraw);
            return true;
        }
        return false;
    }

    async updateVault(vaultId: string, payload: CreatorUpdateVaultDto, user: IUserVaultPayload) {
        const infoVault = await this.repository.findOne({ where: [{ id: vaultId }] });
        if (!infoVault) {
            throw new CustomException('Cannot Vault on System', HttpStatus.BAD_REQUEST);
        }
        const query = this.filterQueryVault({ vaultId: vaultId, address: user.address });
        const result = await query.getOne();
        if (!result) {
            throw new CustomException('cannot access vault', HttpStatus.FORBIDDEN);
        }
        await this.repository.update(vaultId, payload);
        return { status: true, message: 'Vault updated successfully' };
    }

    async calculateTotalAsset(vault: Vault): Promise<string> {
        try {
            if (!vault.contractAddress) {
                return '0';
            }
            return await this.vaultContractService.getVaultValue(vault.contractAddress);
        } catch (err) {
            return '0';
        }
    }

    async deployVault(payload: { name: string; symbol: string; amount: string }) {}

    async updateDepositTxId(vault: Vault, txId: string, owner: string, assets: string, txHash: string) {
        return await this.vaultTransactionService.updateDepositTxId(vault, txId, owner, assets, txHash);
    }

    getDetailVault(user?: IUserVaultPayload, filter?: FilterVaultDto) {
        const query = this.repository.createQueryBuilder('vault');
        query.leftJoinAndSelect('vault.creator', 'user');
        query.leftJoinAndSelect('vault.token', 'token');
        query.leftJoinAndSelect('vault.chain', 'chain');
        query.orderBy('vault.created_at', 'DESC');
        if (filter.tokenId) {
            query.andWhere('vault.token_id =:token_id', { tokenId: filter.tokenId });
        }
        if (filter.contractAddress) {
            query.andWhere('vault.contract_address =:contractAddress', { contractAddress: filter.contractAddress });
        }
        if (filter.chainId) {
            query.andWhere('chain.id =:chainId', { chainId: filter.chainId });
        }
        if (filter.creatorId) {
            query.andWhere('vault.creator_id =:creatorId', { creatorId: filter.creatorId });
        }
        if (filter.vaultId) {
            query.andWhere('vault.id =:vaultId', { vaultId: filter.vaultId });
        }
        return query;
    }

    async updateWithdrawTxId(vault: Vault, withdrawId: any, txHash: string) {
        return await this.vaultTransactionService.updateWithdrawTxId(vault, withdrawId, txHash);
    }

    async getVaultTvl(vaultId: string) {
        const vault = await this.findById(vaultId);
        if (!vault) {
            throw new CustomException('Vault not found', HttpStatus.BAD_REQUEST);
        }
        const tvl = await this.calculateTotalAsset(vault);
        return {
            tvl,
        };
    }

    async totalWithDrawPnlVault(vault: Vault): Promise<string> {
        try {
            const totalTokenVault = await this.vaultTransactionService.getAll({
                vaultId: vault.id,
                status: VAULT_TRANSACTION_STATUS.COMPLETED,
            });

            const totalWithDrawPnl = totalTokenVault
                .filter((deposit) => deposit.type === VAULT_TRANSACTION_TYPE.WITHDRAW)
                .reduce((sum, deposit) => BigInt(sum) + BigInt(deposit?.metadata.profitAmount || 0), BigInt('0'));

            console.log(`totalWithDrawPnl`, totalWithDrawPnl);
            return totalWithDrawPnl.toString();
        } catch (error) {
            console.log('totalWithDrawPnlVault', error);
            return '0';
        }
    }

    async totalWithDrawPnlUser(vault: Vault, userId?: string): Promise<string> {
        try {
            const totalTokenVault = await this.vaultTransactionService.getAll({
                vaultId: vault.id,
                status: VAULT_TRANSACTION_STATUS.COMPLETED,
                userId,
            });

            const totalWithDrawPnl = totalTokenVault
                .filter((deposit) => deposit.type === VAULT_TRANSACTION_TYPE.WITHDRAW)
                .reduce((sum, deposit) => BigInt(sum) + BigInt(deposit?.metadata.profitAmount || 0), BigInt(0));

            console.log(`totalWithDrawPnl`, totalWithDrawPnl);
            return totalWithDrawPnl.toString();
        } catch (error) {
            console.log(error);
            return '0';
        }
    }

    async activeVault(vaultId: string) {
        return await this.repository.update(vaultId, { status: VAULT_STATUS.ACTIVE });
    }

    totalDepositUserInVaultConvert(payload: { userId?: string; vault: Vault }) {
        try {
            const decimal = payload.vault.token.decimals;
            const totalTokenVault = payload.vault.transactions.filter(
                (transaction) => transaction.status === VAULT_TRANSACTION_STATUS.COMPLETED
            );
            const totalDepositUser = totalTokenVault
                .filter(
                    (deposit) => deposit.type === VAULT_TRANSACTION_TYPE.DEPOSIT && deposit.userId === payload.userId
                )
                .reduce((sum, deposit) => BigInt(sum) + BigInt(deposit.amount), BigInt(0));

            const totalWithDrawUser = totalTokenVault
                .filter(
                    (withdraw) =>
                        withdraw.type === VAULT_TRANSACTION_TYPE.WITHDRAW && withdraw.userId === payload.userId
                )
                .reduce((sum, deposit) => BigInt(sum) + BigInt(deposit.amount), BigInt(0));
            const depositUser = totalDepositUser - totalWithDrawUser;
            return +formatUnits(BigInt(depositUser), +decimal);
        } catch (error) {
            console.log(error);
            return 0;
        }
    }

    async getVaultUserCreate(userId: string) {
        return await this.repository.find({ where: [{ creatorId: userId, status: VAULT_STATUS.ACTIVE }] });
    }

    async updateVaultAddress(vaultAddress: string, txHash: string, name: string, symbol: string) {
        return await this.dataSource.transaction(async (manager) => {
            const query = this.repository.createQueryBuilder('vault');
            query.where('lower(vault.name) = lower(:name) AND lower(vault.symbol) = lower(:symbol)', {
                name: name,
                symbol: symbol,
            });
            const vault = await this.findOneQueryBuilder(query);
            if (!vault) {
                return false;
            } else if (!vault.contractAddress) {
                vault.contractAddress = vaultAddress;
                vault.shareTokenAddress = vaultAddress;
                vault.status = VAULT_STATUS.ACTIVE;
                await Promise.all([
                    this.saveWithTransaction(manager, vault),
                    this.vaultTransactionService.updateDepositInit(manager, vault, txHash),
                ]);
            }
            return vault;
        });
    }

    async creatorUpdateVault(vaultId: string, payload: CreatorUpdateVaultDto) {
        return await this.update(vaultId, payload);
    }

    async creatorApproveWithdrawVault(user: UserVaultData, withdrawId: string) {
        return await this.dataSource.transaction(async (manager) => {
            const tx = await this.vaultTransactionService.findForUpdate(manager, { where: { id: withdrawId } });

            if (!tx) {
                throw new CustomException('Transaction not found', HttpStatus.BAD_REQUEST);
            }
            if (tx.status === VAULT_TRANSACTION_STATUS.COMPLETED) {
                throw new CustomException('Transaction already completed', HttpStatus.BAD_REQUEST);
            }
            const [vault, receiver] = await Promise.all([
                this.findById(tx.vaultId),
                this.userService.findById(tx.userId),
            ]);
            if (!vault) {
                throw new CustomException('Vault or Depositor not found', HttpStatus.BAD_REQUEST);
            }
            if (vault.creatorId != user.id) {
                throw new CustomException('You are not creator of this vault', HttpStatus.UNAUTHORIZED);
            }
            if (tx.metadata && tx.metadata.service) {
                if (tx.metadata.service === PROTOCOL_SERVICE.APEX && tx.metadata.signature && tx.metadata.deadline) {
                    // TODO: Create withdraw for apex
                    const payload: RequestWithdrawDto = {
                        amount: tx.amount,
                        requestId: tx.txId,
                        shareOwner: receiver.address,
                        vaultAddress: vault.contractAddress,
                    };
                    const apexRequestWithdrawStatus = await this.vaultValidatorService.requestWithdraw(payload);
                    console.log(`apexRequestWithdrawStatus`, apexRequestWithdrawStatus);
                    if (apexRequestWithdrawStatus && apexRequestWithdrawStatus.status) {
                        tx.status = VAULT_TRANSACTION_STATUS.AWAITING_SUBMIT;
                        if (tx.amount != apexRequestWithdrawStatus.amount) {
                            tx.netAmount = apexRequestWithdrawStatus.amount;
                        }
                        const userPnl = await this.vaultDepositorService.getPnlByUser(receiver.id, vault.id);
                        tx.metadata = {
                            ...tx.metadata,
                            userPnl,
                        };
                        await this.vaultTransactionService.saveWithTransaction(manager, tx);
                        const signature = tx.metadata.signature;
                        const splitSignature = ethers.Signature.from(signature);
                        const deadline = tx.metadata.deadline;
                        const chain = await this.chainService.detail(vault.chainId);
                        return {
                            service: tx.metadata.service,
                            chainInfo: {
                                chainId: chain.chainId,
                                rpc: chain.rpc,
                                chainType: chain.chainType,
                            },
                            params: {
                                assets: apexRequestWithdrawStatus.amount,
                                shareOwner: receiver.address,
                                withdrawalId: tx.txId,
                                signature: {
                                    v: splitSignature.v,
                                    r: splitSignature.r,
                                    s: splitSignature.s,
                                    deadline,
                                },
                            },
                        };
                    } else {
                        throw new CustomException(`Can't request withdraw`, HttpStatus.BAD_REQUEST);
                    }
                }
            }
            tx.status = VAULT_TRANSACTION_STATUS.CONFIRMED;
            tx.deadline = moment().add('10', 'year').unix();
            await this.vaultTransactionService.saveWithTransaction(manager, tx);
            return {
                service: PROTOCOL_SERVICE.VENUS,
                params: null,
            };
        });
    }

    async checkVaultName(name: string): Promise<{ isExist: boolean }> {
        const query = this.repository.createQueryBuilder('vault');
        query.where('lower(vault.name) = lower(:name)', { name: name });
        const count = await query.getCount();
        return {
            isExist: count > 0,
        };
    }

    async getSignatureDeploy(user: UserVaultData, vaultId: string): Promise<CreateVaultData> {
        const vault = await this.findById(vaultId);
        if (!vault) {
            throw new CustomException(`Vault not found`, HttpStatus.BAD_REQUEST);
        }
        if (vault.creatorId != user.id) {
            throw new CustomException(`You are not creator of this vault`, HttpStatus.UNAUTHORIZED);
        }
        if (vault.contractAddress) {
            throw new CustomException(`Vault already deployed`, HttpStatus.BAD_REQUEST);
        }
        const [token, chain, protocol] = await Promise.all([
            this.tokenService.detail(vault.tokenId),
            this.chainService.detail(vault.chainId),
            this.protocolService.detail(vault.defaultProtocolId),
        ]);
        let maxDeposit = vault.depositRule?.max.toString();
        if (maxDeposit) {
            if (maxDeposit == '0') {
                maxDeposit = ethers.MaxUint256.toString();
            } else {
                maxDeposit = parseUnits(maxDeposit, +token.decimals).toString();
            }
        } else {
            maxDeposit = ethers.MaxUint256.toString();
        }
        let minD = vault.depositRule?.min
            ? parseUnits(vault.depositRule.min.toString(), +token.decimals).toString()
            : parseUnits('1', +token.decimals).toString();

        // TODO: Get signature from validator
        const payloadCreateVaultDto: GetSignatureCreateVaultDto = {
            authority: user.address,
            initialAgentDeposit: vault.depositInit.amountDeposit,
            maxDeposit,
            minDeposit: minD,
            protocolHelper: protocol.strategy,
            protocol: protocol.service.toUpperCase(),
            shareTokenName: vault.name,
            shareTokenSymbol: vault.symbol,
            underlying: token.address,
            vaultId: vaultId,
            chainId: chain.chainId,
        };
        const res = await this.vaultValidatorService.createVault(payloadCreateVaultDto);
        console.log(`signature validator`, res);

        return { signature: res.signature, vaultParam: res.vaultParam, vaultId: vault.id };
    }

    async createActionOnVault(user: UserVaultData, vaultId: string, payload: CreatorCreateVaultActionDto) {
        const vault = await this.findOne({
            where: {
                id: vaultId,
            },
            relations: ['protocol'],
        });
        if (!vault) {
            throw new CustomException('Vault not found', HttpStatus.BAD_REQUEST);
        }
        if (vault.creatorId != user.id) {
            throw new CustomException(`You are not creator of this vault`, HttpStatus.UNAUTHORIZED);
        }
        const action = await this.actionService.findOneByWhere({ command: payload.command, status: STATUS.ACTIVE });
        if (!action) {
            throw new CustomException(`Action not found`, HttpStatus.BAD_REQUEST);
        }
        throw new CustomException(`Action not support`, HttpStatus.BAD_REQUEST);
    }

    async updateClaimTxId(vault: Vault, requestId: string, receiver: string, amount: string, txHash: string) {
        return await this.vaultTransactionService.updateClaimTxId(vault, requestId, receiver, amount, txHash);
    }

    async executeActionFromProtocol(payload: CreateVaultActionDto) {
        payload.executeId = '0x' + uuid().replace(/-/g, '');
        return await this.vaultValidatorService.executeAction(payload);
    }

    private async getPNLAlltime(vault: Vault): Promise<string> {
        const totalPnlWithDrawVault = await this.totalWithDrawPnlVault(vault);
        const totalAsset = await this.calculateTotalAsset(vault);
        const totalDepositVault = await this.vaultDepositorService.getTotalDepositByVaultId(vault.id);
        console.log(`totalPnlWithDrawVault`, totalPnlWithDrawVault);
        console.log(`totalAsset getPNLAlltime`, totalAsset);
        console.log(`totalDepositVault`, totalDepositVault);

        return (BigInt(totalAsset) - BigInt(totalDepositVault) + BigInt(totalPnlWithDrawVault)).toString();
    }

    private async vaultDetailPayload(vault: Vault, user?: IUserVaultPayload) {
        if (!vault) {
            return null;
        }
        const [totalAsset, token, chain] = await Promise.all([
            this.calculateTotalAsset(vault),
            this.tokenService.detail(vault.tokenId),
            this.chainService.detail(vault.chainId),
        ]);
        vault.chain = chain;
        vault.token = token;
        const totalAssetVault = +formatUnits(BigInt(totalAsset), +vault.token.decimals);

        //Get Total share user
        let yourPnl = '0';
        let yourDeposit = '0';

        if (user) {
            const totalPnlWithDrawUser = await this.totalWithDrawPnlUser(vault, user.id);
            let currentUserPNL = await this.vaultDepositorService.getPnlByUser(user.id, vault.id);
            yourPnl = (BigInt(totalPnlWithDrawUser) + BigInt(currentUserPNL)).toString();
            let depositor = await this.vaultDepositorService.getDepositorByUserIdAndVaultId(user.id, vault.id);
            yourDeposit = depositor?.principalAmount ?? '0';
            console.log(`totalPnlWithDrawUser`, totalPnlWithDrawUser);
            console.log(`currentUserPNL`, currentUserPNL);
        }

        let allTimePnl = '0';
        let totalPnlWithDraw = await this.totalWithDrawPnlUser(vault);
        const totalDepositVault = await this.vaultDepositorService.getTotalDepositByVaultId(vault.id);
        const userDepositVault = await this.vaultDepositorService.getUserDepositByVault(user?.id, vault.id);
        allTimePnl = (BigInt(totalAsset) - BigInt(totalDepositVault) + BigInt(totalPnlWithDraw)).toString();

        return {
            ...plainToInstance(Vault, vault),
            isJoined: userDepositVault.length > 0,
            pnlChartUrl: `https://cdn.mirailabs.co/vault/chart/${vault.contractAddress}.png`,
            mdd: '',
            profitShare: `${100 - Number(vault.fee.performanceFee)}`,
            maxTvl: vault.depositInit?.maxCapacity,
            pnlPercentage: '',
            asset: vault.token,
            tvl: totalAssetVault.toString(),
            age: moment().diff(moment(vault.createdAt), 'day'),
            apr: 0,
            allTimePnl: formatUnits(BigInt(allTimePnl), +token.decimals).toString(),
            yourDeposit: user ? formatUnits(BigInt(yourDeposit), +token.decimals).toString() : undefined,
            yourPnl: user ? formatUnits(BigInt(yourPnl), +token.decimals).toString() : undefined,
            pnlLast24h: '0',
        };
    }

    private async checkVaultExist(name: string, symbol: string) {
        const query = this.repository.createQueryBuilder('vault');
        query.where('lower(vault.name) = lower(:name) AND lower(vault.symbol) = lower(:symbol)', {
            name: name,
            symbol: symbol,
        });
        return await query.getCount();
    }

    private getUserInVault(user?: IUserVaultPayload) {
        const query = this.repository.createQueryBuilder('vault');
        query.leftJoinAndSelect('vault.creator', 'user');
        query.leftJoinAndSelect('vault.transactions', 'transactions');
        if (user?.id) {
            query.where('user.id = :userId', { userId: user.id });
        }
        return query;
    }

    private filterQueryWithDrawAllVault(payload: {
        vaultId: string;
        user: IUserVaultPayload;
        status?: VAULT_TRANSACTION_STATUS;
    }) {
        const query = this.repository.createQueryBuilder('vault');
        query.leftJoinAndSelect('vault.creator', 'user');
        query.leftJoinAndSelect('vault.transactions', 'transactions');
        query.where('vault.id =:vaultId', { vaultId: payload.vaultId });
        query.andWhere('user.id =:userId', { userId: payload.user.id });
        query.andWhere('transactions.status =:status', { status: payload.status });
        return query;
    }

    private filterQueryWithDraw(payload: {
        creatorId?: string;
        idTransaction?: string;
        status?: VAULT_TRANSACTION_STATUS;
    }) {
        const query = this.repository.createQueryBuilder('vault');
        query.leftJoinAndSelect('vault.creator', 'user');
        query.leftJoinAndSelect('vault.transactions', 'transactions');
        query.leftJoin('vault.protocol', 'protocol');
        query.where('vault.creator_id =:id', { id: payload.creatorId });
        query.andWhere('transactions.id =:idTransaction', { idTransaction: payload.idTransaction });
        query.andWhere('vault.status = :status', { status: payload.status });
        return query;
    }

    private filterVaultCreator(filter: CreatorFilterVaultDto, user: IUserVaultPayload) {
        const query = this.repository.createQueryBuilder('vault');
        query.leftJoinAndSelect('vault.creator', 'user');
        query.where('user.id =:creatorId', { creatorId: user.id });
        if (filter.tokenId) {
            query.andWhere('vault.token_id =:tokenId', { tokenId: filter.tokenId });
        }
        if (filter.chainId) {
            query.andWhere('vault.chain_id =:chainId', { chainId: filter.chainId });
        }
        if (filter.contractAddress) {
            query.andWhere('vault.contract_address =:contractAddress', { contractAddress: filter.contractAddress });
        }
        return query;
    }

    private async getListVault(filter: FilterVaultDto, user?: IUserVaultPayload) {
        const query = this.repository
            .createQueryBuilder('vault')
            .leftJoinAndSelect('vault.creator', 'user')
            .leftJoinAndSelect('vault.protocol', 'protocol')
            .orderBy('vault.created_at', 'DESC');

        if (filter.chainId) {
            query.andWhere('vault.chain_id = :chainId', { chainId: filter.chainId });
        }
        if (filter.name) {
            query.andWhere('vault.name ILIKE :name', { name: `%${filter.name}%` });
        }
        if (filter.tokenId) {
            query.andWhere('vault.token_id = :tokenId', { tokenId: filter.tokenId });
        }
        if (filter.filterStatus) {
            query.andWhere('vault.status IN(:...status)', { status: filter.filterStatus.split(',') });
        }
        if (filter.contractAddress) {
            query.andWhere('vault.contract_address = :contractAddress', {
                contractAddress: filter.contractAddress,
            });
        }
        if (filter.creatorId) {
            query.andWhere('user.id = :creatorId', { creatorId: filter.creatorId });
        }
        if (filter.services) {
            let services = filter.services.split(',').map((service) => service.trim());
            query.andWhere('protocol.service IN(:...services)', { services });
        }
        return query;
    }

    private filterQueryVault(payload: { vaultId: string; address: string }) {
        const query = this.repository.createQueryBuilder('vault');
        query.leftJoinAndSelect('vault.creator', 'user');
        query.where('vault.id = :vaultId', { vaultId: payload.vaultId });
        query.andWhere('user.address = :address', { address: payload.address });
        return query;
    }

    private async getCurrentBalance(vaultAddress: string, chain: Chain, decimalTokenDeposit: number): Promise<number> {
        let total: any = BigInt(0);
        if (chain.chainType === ChainType.EVM) {
            const rpc = chain.rpc[Math.floor(Math.random() * chain.rpc.length)];
            const provider = new ethers.JsonRpcProvider(rpc, {
                name: 'unknown',
                chainId: chain.chainId,
            });
            const vaultFactory = EVMVault__factory.connect(vaultAddress, provider);
            const balance = await vaultFactory.getVaultValue();
            console.log(`balance`, balance);
            total = BigInt(total) + balance;
            return total;
        } else if (chain.chainType === ChainType.SOLANA) {
        }
        return total;
    }

    private async getPNLVaultWithdraw(vault: Vault) {
        const totalTokenVault = vault.transactions.filter(
            (transaction) => transaction.status === VAULT_TRANSACTION_STATUS.COMPLETED
        );
        const totalWithDrawPnl = totalTokenVault
            .filter((deposit) => deposit.type === VAULT_TRANSACTION_TYPE.WITHDRAW)
            .reduce((sum, deposit) => BigInt(sum) + BigInt(deposit.metadata.profitAmount || '0'), BigInt(0));
        console.log(`totalWithDrawPnl`, totalWithDrawPnl);
        return totalWithDrawPnl.toString();
    }

    private calculateAPY(tvlData: { start: number; end: number }[], createdDate: string): number {
        if (tvlData.length === 0) {
            throw new Error('At least one TVL data point is required.');
        }

        const currentDate = moment();
        const totalDays = currentDate.diff(moment(createdDate), 'days');
        const x = totalDays >= 30 ? 30 : totalDays;

        let Rmonth = 1;
        for (const period of tvlData) {
            if (period.start === 0) continue;
            const ri = period.end / period.start - 1;
            Rmonth *= 1 + ri;
        }
        Rmonth -= 1;

        const APY = (Math.pow(1 + Rmonth, 365 / x) - 1) * 100;

        return APY;
    }
}

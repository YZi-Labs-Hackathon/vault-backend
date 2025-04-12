import { CommonService } from '@app/modules/shared/common/common.service';
import { VaultTransaction } from '@app/modules/vault/entities/vault-transaction.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DataSource, EntityManager, Repository } from 'typeorm';
import { FilterVaultTransactionDto } from '@app/modules/vault/dto/filter-vault-transaction.dto';
import { QueryPaginateDto } from '@app/modules/shared/dto';
import { IUserVaultPayload } from '@app/modules/user/user.type';
import { VAULT_TRANSACTION_STATUS, VAULT_TRANSACTION_TYPE } from '@app/modules/vault/vault.constants';
import { forwardRef, HttpStatus, Inject } from '@nestjs/common';
import { VaultDepositorService } from '@app/modules/vault/services/vault-depositor.service';
import { CreateVaultTransactionDto, VaultWithdrawSignatureDto } from '@app/modules/vault/dto';
import { Vault } from '@app/modules/vault/entities/vault.entity';
import { TokenService } from '@app/modules/token/services/token.service';
import { VaultService } from '@app/modules/vault/services/vault.service';
import { UserService } from '@app/modules/user/services/user.service';
import { VaultActivityService } from '@app/modules/vault/services/vault-activity.service';
import { plainToInstance } from 'class-transformer';
import { CustomException } from '@app/common/errors';
import { UserVaultData } from '@app/modules/auth/auth.types';
import { CreateUserDto } from '@app/modules/user/dto';
import { ChainType } from '@app/common/types';
import { formatUnits } from 'ethers';

export class VaultTransactionService extends CommonService<VaultTransaction> {
    private readonly VAULT_SHARE_TOKEN_DECIMALS = +process.env.VAULT_SHARE_TOKEN_DECIMALS || 18;

    constructor(
        @InjectRepository(VaultTransaction) readonly repository: Repository<VaultTransaction>,
        private readonly dataSource: DataSource,
        @Inject(forwardRef(() => VaultDepositorService)) private readonly vaultDepositorService: VaultDepositorService,
        @Inject(forwardRef(() => VaultService)) private readonly vaultService: VaultService,
        private readonly tokenService: TokenService,
        private readonly userService: UserService,
        @Inject(forwardRef(() => VaultActivityService)) private readonly vaultActivityService: VaultActivityService
    ) {
        super(repository);
    }

    async addTransaction(payload: CreateVaultTransactionDto): Promise<VaultTransaction> {
        return await this.create(payload);
    }

    async getAll(filter: FilterVaultTransactionDto) {
        const query = this.filterQuery(filter);
        return await this.findAllQueryBuilder(query);
    }

    async getDepositorsTransactions(
        filter: FilterVaultTransactionDto,
        paginate: QueryPaginateDto,
        user: IUserVaultPayload
    ) {
        const query = this.filterQuery(filter);
        return await this.paginateQueryBuilder(query, paginate);
    }

    async getTotalBalanceWithDrawByUser(vaultId: string, userId: string): Promise<string> {
        const query = this.filterQuery({
            vaultId,
            userId,
            type: VAULT_TRANSACTION_TYPE.WITHDRAW,
            status: VAULT_TRANSACTION_STATUS.COMPLETED,
        });
        const transactions = await this.findAllQueryBuilder(query);
        console.log(`transactions`, transactions);
        const totalWithDraw = transactions.reduce((sum, tx) => BigInt(sum) + BigInt(tx.amount), BigInt(0));

        return totalWithDraw.toString();
    }

    async getDepositVaultUser(userId: string) {
        return await this.repository.find({
            where: {
                userId: userId,
                type: VAULT_TRANSACTION_TYPE.DEPOSIT,
                status: VAULT_TRANSACTION_STATUS.COMPLETED,
            },
        });
    }

    async getUserPNLLast24h(userId: string, vaultId: string): Promise<string> {
        const fromDate = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);

        const result = await this.repository
            .createQueryBuilder('transaction')
            .select([
                `transaction.type = 'DEPOSIT' AND transaction.status = 'COMPLETED'`,
                `transaction.type = 'WITHDRAW' AND transaction.status = 'COMPLETED'`,
            ])
            .where('transaction.user_id = :userId', { userId })
            .andWhere('transaction.created_at >= :fromDate', { fromDate })
            .andWhere('transaction.vault_id = :vaultId', { vaultId: vaultId })
            .getMany();
        const totalDeposit = result
            .filter((tx) => tx.type === VAULT_TRANSACTION_TYPE.DEPOSIT)
            .reduce((sum, tx) => BigInt(sum) + BigInt(tx.netAmount), BigInt(0));

        const totalWithdraw = result
            .filter((tx) => tx.type === VAULT_TRANSACTION_TYPE.WITHDRAW)
            .reduce((sum, tx) => BigInt(sum) + BigInt(tx.netAmount), BigInt(0));

        return (BigInt(totalDeposit) - BigInt(totalWithdraw)).toString();
    }

    async updateDepositTxId(vault: Vault, txId: string, owner: string, assets: string, txHash: string) {
        return await this.dataSource.transaction(async (manager) => {
            let transaction = await this.findForUpdate(manager, {
                where: {
                    vaultId: vault.id,
                    type: VAULT_TRANSACTION_TYPE.DEPOSIT,
                    txId: txId,
                    status: VAULT_TRANSACTION_STATUS.PENDING,
                },
            });
            if (!transaction) {
                let user = await this.userService.findOneByWhere({ address: owner });
                if (!user) {
                    const newUserDto: CreateUserDto = {
                        address: owner,
                        chainType: ChainType.EVM,
                    };
                    user = await this.userService.createWithTransaction(manager, newUserDto);
                }
                const tx: CreateVaultTransactionDto = {
                    amount: assets,
                    // share: shares,
                    status: VAULT_TRANSACTION_STATUS.COMPLETED,
                    txHash: txHash,
                    type: VAULT_TRANSACTION_TYPE.DEPOSIT,
                    userId: user.id,
                    vaultId: vault.id,
                    netAmount: assets,
                };
                transaction = await this.createWithTransaction(manager, tx);
                await this.vaultDepositorService.addDeposit(manager, vault, user, transaction);
            } else {
                transaction.status = VAULT_TRANSACTION_STATUS.COMPLETED;
                transaction.txHash = txHash;
                transaction.netAmount = assets;
                await this.saveWithTransaction(manager, transaction);
                await this.vaultDepositorService.syncDeposit(manager, vault, transaction);
            }

            return true;
        });
    }

    async syncPnlWithDraw(vaultId: string) {
        const vault = await this.vaultService.findOne({ relations: ['token'], where: [{ id: vaultId }] });
        console.log(vault);
        const transactions = await this.repository.find({
            where: {
                vaultId: vault.id,
                type: VAULT_TRANSACTION_TYPE.WITHDRAW,
            },
        });
        return transactions.map(async (transaction) => {
            if (
                transaction.status === VAULT_TRANSACTION_STATUS.COMPLETED &&
                transaction.type === VAULT_TRANSACTION_TYPE.WITHDRAW
            ) {
                const token = await this.tokenService.detail(vault.tokenId);
                const s = formatUnits(transaction.share, +this.VAULT_SHARE_TOKEN_DECIMALS);
                const m = formatUnits(transaction.amount, +token.decimals);
                const rateShare = +m / +s;
                const pnl = Number(m) * (rateShare - 1);
                console.log(pnl);
                transaction.metadata.pnl = pnl.toFixed(token.decimals);
                await this.repository.save(transaction);
            }
            return true;
        });
    }

    async updateWithdrawTxId(vault: Vault, withdrawId: any, txHash: string) {
        return await this.dataSource.transaction(async (manager) => {
            const transaction = await this.findForUpdate(manager, {
                where: {
                    vaultId: vault.id,
                    type: VAULT_TRANSACTION_TYPE.WITHDRAW,
                    txId: withdrawId,
                },
            });
            if (transaction && transaction.status != VAULT_TRANSACTION_STATUS.COMPLETED) {
                const depositor = await this.vaultDepositorService.findForUpdate(manager, {
                    where: {
                        vaultId: vault.id,
                        userId: transaction.userId,
                    },
                });
                if (!depositor) {
                    return true;
                }
                const token = await this.tokenService.detail(vault.tokenId);
                transaction.txHash = txHash;
                transaction.status = VAULT_TRANSACTION_STATUS.COMPLETED;
                if (transaction.metadata && transaction.metadata.userPnl && transaction.metadata.userPrincipalDeposit) {
                    const { userPnl, userPrincipalDeposit } = transaction.metadata;
                    const x = BigInt(transaction.amount) * BigInt(userPrincipalDeposit);
                    const y = BigInt(userPrincipalDeposit) + BigInt(userPnl);
                    let profitAmount = '0';
                    let principalAmount = '0';
                    if (y.toString() != '0') {
                        principalAmount = (x / y).toString();
                        profitAmount = (BigInt(transaction.amount) - BigInt(principalAmount)).toString();
                        transaction.metadata = {
                            ...transaction.metadata,
                            profitAmount: profitAmount,
                            principalAmount,
                        };
                    }
                    let fee = BigInt(0);
                    if (transaction.fees && transaction.fees.length > 0) {
                        for (let _fee of transaction.fees) {
                            fee = BigInt(fee) + BigInt(_fee?.fee ?? 0);
                        }
                        principalAmount = (BigInt(principalAmount) + BigInt(fee)).toString();
                        transaction.metadata.principalAmount = principalAmount;
                    }

                    depositor.amount = (BigInt(depositor.amount) - BigInt(principalAmount)).toString();
                    depositor.principalAmount = (
                        BigInt(depositor.principalAmount) - BigInt(principalAmount)
                    ).toString();
                    await this.vaultDepositorService.saveWithTransaction(manager, depositor);
                }
                // }
                await this.saveWithTransaction(manager, transaction);
            }

            return true;
        });
    }

    async updateDepositInit(manager: EntityManager, vault: Vault, txHash: string) {
        const transaction = await this.findOne({
            where: {
                vaultId: vault.id,
                type: VAULT_TRANSACTION_TYPE.DEPOSIT,
                txId: `${vault.id}_INIT`,
                status: VAULT_TRANSACTION_STATUS.PENDING,
            },
        });
        if (!transaction) {
            return;
        }
        transaction.status = VAULT_TRANSACTION_STATUS.COMPLETED;
        transaction.txHash = txHash;
        await Promise.all([
            this.saveWithTransaction(manager, transaction),
            this.vaultDepositorService.addDepositInit(manager, vault, transaction.userId, transaction.amount),
        ]);
        return;
    }

    async getPaginate(_filter: FilterVaultTransactionDto, paginate: QueryPaginateDto) {
        const query = this.filterQuery(_filter);
        const rs = await this.paginateQueryBuilder(query, paginate);
        return {
            items: plainToInstance(VaultTransaction, await Promise.all(rs.items.map((item) => this.toPayload(item)))),
            meta: rs.meta,
        };
    }

    async toPayload(transaction: VaultTransaction) {
        transaction.user = await this.userService.detail(transaction.userId);
        transaction.vault = transaction.vault.toDetailTransaction();
        const [totalWithdraw, withdrawable, yourDeposit] = await Promise.all([
            this.getTotalBalanceWithDrawByUser(transaction.vaultId, transaction.userId),
            this.vaultDepositorService.getAmountAvailableToWithdrawByUser(transaction.vaultId, transaction.userId),
            await this.vaultDepositorService.getDepositorByUserIdAndVaultId(transaction.userId, transaction.vaultId),
        ]);

        transaction.userVaultStatistic = {
            totalWithdraw,
            withdrawable,
            yourDeposit: yourDeposit.amount,
        };
        return plainToInstance(VaultTransaction, transaction);
    }

    async updateSignatureWithdraw(user: UserVaultData, txId: string, payload: VaultWithdrawSignatureDto) {
        return await this.dataSource.transaction(async (manager) => {
            const tx = await this.findForUpdate(manager, {
                where: {
                    txId: txId,
                    userId: user.id,
                    type: VAULT_TRANSACTION_TYPE.WITHDRAW,
                    status: VAULT_TRANSACTION_STATUS.PENDING,
                },
            });
            if (!tx) {
                throw new CustomException('Transaction not found', HttpStatus.NOT_FOUND);
            }
            if (tx.status !== VAULT_TRANSACTION_STATUS.PENDING) {
                throw new CustomException('Transaction is not pending', HttpStatus.BAD_REQUEST);
            }
            tx.metadata = {
                ...tx.metadata,
                signature: payload.signature,
                deadline: payload.deadline,
            };
            tx.status = VAULT_TRANSACTION_STATUS.AWAITING;
            await this.saveWithTransaction(manager, tx);

            return true;
        });
    }

    async getUserPnlWithdrawByVautlId(userId: string, vaultId: string) {
        try {
            const transactions = await this.findAllQueryBuilder(
                this.filterQuery({
                    vaultId,
                    userId,
                    type: VAULT_TRANSACTION_TYPE.WITHDRAW,
                    status: VAULT_TRANSACTION_STATUS.COMPLETED,
                })
            );

            const totalWithDrawPnl = transactions.reduce(
                (sum, withdraw) => BigInt(sum) + BigInt(withdraw?.metadata.profitAmount ?? 0),
                BigInt(0)
            );

            console.log(`totalWithDrawPnl`, totalWithDrawPnl);
            return totalWithDrawPnl.toString();
        } catch (error) {
            console.log(error);
            return '0';
        }
    }

    async updateClaimTxId(vault: Vault, requestId: string, receiver: string, amount: string, txHash: string) {
        return await this.dataSource.transaction(async (manager) => {
            const transaction = await this.findForUpdate(manager, {
                where: {
                    vaultId: vault.id,
                    type: VAULT_TRANSACTION_TYPE.WITHDRAW,
                    txId: requestId,
                },
            });
            if (transaction && transaction.status != VAULT_TRANSACTION_STATUS.COMPLETED) {
                const depositor = await this.vaultDepositorService.findForUpdate(manager, {
                    where: {
                        vaultId: vault.id,
                        userId: transaction.userId,
                    },
                });
                if (!depositor) {
                    return true;
                }
                transaction.txHash = txHash;
                transaction.netAmount = amount;
                transaction.status = VAULT_TRANSACTION_STATUS.COMPLETED;
                if (transaction.metadata && transaction.metadata.userPnl && transaction.metadata.userPrincipalDeposit) {
                    const { userPnl, userPrincipalDeposit } = transaction.metadata;
                    const x = BigInt(transaction.amount) * BigInt(userPrincipalDeposit);
                    const y = BigInt(userPrincipalDeposit) + BigInt(userPnl);
                    let profitAmount = '0';
                    let principalAmount = '0';
                    if (y.toString() != '0') {
                        principalAmount = (x / y).toString();
                        profitAmount = (BigInt(transaction.amount) - BigInt(principalAmount)).toString();
                        transaction.metadata = {
                            ...transaction.metadata,
                            profitAmount: profitAmount,
                            principalAmount,
                        };
                    }
                    let fee = BigInt(0);
                    if (transaction.fees && transaction.fees.length > 0) {
                        for (let _fee of transaction.fees) {
                            fee = BigInt(fee) + BigInt(_fee?.fee ?? 0);
                        }
                        principalAmount = (BigInt(principalAmount) + BigInt(fee)).toString();
                        transaction.metadata.principalAmount = principalAmount;
                    }

                    depositor.amount = (BigInt(depositor.amount) - BigInt(principalAmount)).toString();
                    depositor.principalAmount = (
                        BigInt(depositor.principalAmount) - BigInt(principalAmount)
                    ).toString();
                    await this.vaultDepositorService.saveWithTransaction(manager, depositor);
                }
                await this.saveWithTransaction(manager, transaction);
            }

            return true;
        });
    }

    private filterQuery(filter: FilterVaultTransactionDto) {
        const query = this.repository.createQueryBuilder('vaultTransaction');
        query.leftJoinAndSelect('vaultTransaction.vault', 'vault');
        query.leftJoinAndSelect('vault.token', 'token');
        query.leftJoinAndSelect('vault.chain', 'chain');
        query.orderBy('vaultTransaction.created_at', 'DESC');

        if (filter.id) {
            query.andWhere('vaultTransaction.id = :id', { id: filter.id });
        }
        if (filter.userId) {
            console.log('userId');
            query.andWhere('vaultTransaction.userId = :userId', { userId: filter.userId });
        }
        if (filter.vaultId) {
            query.andWhere('vault.id = :vaultId', { vaultId: filter.vaultId });
        }
        if (filter.status) {
            query.andWhere('vaultTransaction.status = :status', { status: filter.status });
        }
        if (filter.type) {
            query.andWhere('vaultTransaction.type = :type', { type: filter.type });
        }
        if (filter.timeStart) {
            query.andWhere('vaultTransaction.created_at >= :timeStart', {
                timeStart: new Date(filter.timeStart * 1000),
            });
        }
        if (filter.endTime) {
            query.andWhere('vaultTransaction.created_at <= :endTime', { endTime: new Date(filter.endTime * 1000) });
        }
        if (filter.txId) {
            query.andWhere('vaultTransaction.txId = :txId', { txId: filter.txId });
        }
        if (filter.statusFilter) {
            query.andWhere('vaultTransaction.status IN(:...statusFilter)', {
                statusFilter: filter.statusFilter.split(','),
            });
        }
        if (filter.search) {
            console.log('search');
            query.andWhere(
                new Brackets((qb) => {
                    qb.where('vault.name ILIKE :search', { search: `%${filter.search}%` })
                        .orWhere('vault.description ILIKE :search', { search: `%${filter.search}%` })
                        .orWhere('vaultTransaction.txId ILIKE :search', { search: `%${filter.search}%` })
                        .orWhere('vaultTransaction.txHash ILIKE :search', { search: `%${filter.search}%` });
                })
            );
        }

        if (filter.creatorId) {
            query.andWhere('vault.creatorId = :creatorId', { creatorId: filter.creatorId });
        }

        return query;
    }
}

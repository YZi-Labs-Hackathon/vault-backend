import { Injectable } from '@nestjs/common';
import { CommonService } from '@app/modules/shared/common/common.service';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { VaultActivity } from '@app/modules/vault/entities/vault-activity.entity';
import { CreateVaultActivityDto, FilterVaultActivityDto } from '@app/modules/vault/dto';
import { VaultTransaction } from '@app/modules/vault/entities/vault-transaction.entity';
import { VAULT_ACTIVITY_STATUS } from '@app/modules/vault/vault.constants';
import { QueryPaginateDto } from '@app/modules/shared/dto';
import { plainToInstance } from 'class-transformer';
import { Vault } from '@app/modules/vault/entities/vault.entity';
import { ProtocolActionService } from '@app/modules/protocol/services/protocol-action.service';
import { PROTOCOL_SERVICE } from '@app/modules/protocol/protocol.type';

@Injectable()
export class VaultActivityService extends CommonService<VaultActivity> {
    constructor(
        @InjectRepository(VaultActivity) readonly repository: Repository<VaultActivity>,
        private readonly protocolActionService: ProtocolActionService
    ) {
        super(repository);
    }

    async getVaultActivities(vaultId: string, filter: FilterVaultActivityDto, paginate: QueryPaginateDto) {
        filter.vaultId = vaultId;
        const query = this.filterQuery(filter);
        const result = await this.paginateQueryBuilder(query, paginate);
        const items = result.items.map(({ txHash, ...rest }) => {
            return rest.protocol === PROTOCOL_SERVICE.APEX ? rest : { txHash, ...rest };
        });
        return { items: items, meta: result.meta };
    }

    filterQuery(filter: FilterVaultActivityDto) {
        const query = this.repository.createQueryBuilder('activity');
        query.distinct(true);
        query.orderBy('activity.created_at', 'DESC');
        query.leftJoinAndSelect('activity.vault', 'vault');
        query.leftJoinAndSelect('vault.chain', 'chain');
        query.leftJoinAndSelect('vault.protocol', 'protocol');
        query.leftJoinAndSelect('vault.token', 'token');
        if (filter.id) {
            query.andWhere('activity.id = :id', { id: filter.id });
        }
        if (filter.vaultId) {
            query.andWhere('activity.vaultId = :vaultId', { vaultId: filter.vaultId });
        }
        if (filter.type) {
            query.andWhere('activity.type = :type', { type: filter.type });
        }
        if (filter.status) {
            query.andWhere('activity.status = :status', { status: filter.status });
        }
        if (filter.txHash) {
            query.andWhere('activity.txHash = :txHash', { txHash: filter.txHash });
        }
        if (filter.protocol) {
            query.andWhere('activity.protocol = :protocol', { protocol: filter.protocol });
        }
        if (filter.creatorId) {
            query.andWhere('vault.creatorId = :creatorId', { creatorId: filter.creatorId });
        }
        return query;
    }

    async addActivityInit(manager: EntityManager, vault: Vault, transaction: VaultTransaction, txHash: string) {
        const defaultProtocolAction = await this.protocolActionService.findOneByWhere({
            protocolId: vault.defaultProtocolId,
            isDefault: true,
        });
        if (defaultProtocolAction) {
            const activity: CreateVaultActivityDto = {
                metadata: {
                    transactionId: transaction.id,
                    amount: transaction.amount,
                    share: transaction.share,
                },
                protocol: defaultProtocolAction.protocol.service,
                status: VAULT_ACTIVITY_STATUS.COMPLETED,
                txHash: txHash,
                type: defaultProtocolAction.action.command,
                vaultId: vault.id,
            };
            return this.createWithTransaction(manager, activity);
        }
        return true;
    }

    async getPaginate(_filter: FilterVaultActivityDto, paginate: QueryPaginateDto) {
        const query = this.filterQuery(_filter);
        const rs = await this.paginateQueryBuilder(query, paginate);
        return {
            items: plainToInstance(VaultActivity, rs.items),
            meta: rs.meta,
        };
    }
}

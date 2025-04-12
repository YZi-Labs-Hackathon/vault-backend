import { Injectable } from '@nestjs/common';
import { CommonService } from '@app/modules/shared/common/common.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VaultAction } from '@app/modules/vault/entities/vault-action.entity';
import { FilterVaultActionDto } from '@app/modules/vault/dto/filter-vault-action.dto';
import { plainToInstance } from 'class-transformer';
import { VAULT_ACTION_STATUS } from '@app/modules/vault/vault.constants';

@Injectable()
export class VaultActionService extends CommonService<VaultAction> {
    constructor(@InjectRepository(VaultAction) readonly repository: Repository<VaultAction>) {
        super(repository);
    }

    async getAll(filter: FilterVaultActionDto) {
        const query = this.filterQuery(filter);
        const results = await this.findAllQueryBuilder(query);
        return plainToInstance(VaultAction, results);
    }

    async getActionsActiveByVaultId(vaultId: string) {
        const query = this.filterQuery({ vaultId, status: VAULT_ACTION_STATUS.PROCESSING });
        query.leftJoinAndSelect('vaultAction.protocolAction', 'protocolAction');
        query.leftJoinAndSelect('protocolAction.action', 'action');
        query.leftJoinAndSelect('protocolAction.protocol', 'protocol');
        const results = await this.findAllQueryBuilder(query);
        return plainToInstance(VaultAction, results);
    }

    async toPayload(vaultAction: VaultAction) {
        if (!vaultAction) {
            return null;
        }
        return plainToInstance(VaultAction, vaultAction);
    }

    async findOneByWhere(filter: FilterVaultActionDto) {
        if (!filter || Object.keys(filter).length === 0) {
            return null;
        }
        const query = this.filterQuery(filter);
        const result = await this.findOneQueryBuilder(query);
        return plainToInstance(VaultAction, result);
    }

    filterQuery(filter: FilterVaultActionDto) {
        const query = this.repository.createQueryBuilder('vaultAction');
        query.distinct(true);
        if (filter.id) {
            query.andWhere('vaultAction.id = :id', { id: filter.id });
        }
        if (filter.vaultId) {
            query.andWhere('vaultAction.vaultId = :vaultId', { vaultId: filter.vaultId });
        }
        if (filter.protocolActionId) {
            query.andWhere('vaultAction.protocolActionId = :protocolActionId', {
                protocolActionId: filter.protocolActionId,
            });
        }
        if (filter.status) {
            query.andWhere('vaultAction.status = :status', { status: filter.status });
        }
        return query;
    }
}

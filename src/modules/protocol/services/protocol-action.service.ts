import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CommonService } from '@app/modules/shared/common/common.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProtocolAction } from '@app/modules/protocol/entities/protocol-action.entity';
import { STATUS } from '@app/modules/shared/shared.constants';
import { _CreateProtocolActionDto } from '@app/modules/protocol/dto';
import { plainToInstance } from 'class-transformer';
import { ActionService } from '@app/modules/protocol/services/action.service';
import { ProtocolService } from '@app/modules/protocol/services/protocol.service';

@Injectable()
export class ProtocolActionService extends CommonService<ProtocolAction> {
    constructor(
        @InjectRepository(ProtocolAction) readonly repository: Repository<ProtocolAction>,
        @Inject(forwardRef(() => ActionService)) private readonly actionService: ActionService,
        @Inject(forwardRef(() => ProtocolService)) private readonly protocolService: ProtocolService
    ) {
        super(repository);
    }

    async findOneByWhere(filter) {
        if (!filter || Object.keys(filter).length == 0) {
            return null;
        }
        const query = this.filterQuery(filter);
        const protocolAction = await this.findOneQueryBuilder(query);
        return await this.toPayload(protocolAction);
    }

    async toPayload(protocolAction: ProtocolAction) {
        if (!protocolAction) {
            return null;
        }
        protocolAction.protocol = await this.protocolService.detail(protocolAction.protocolId);
        protocolAction.action = await this.actionService.detail(protocolAction.actionId);
        return plainToInstance(ProtocolAction, protocolAction);
    }

    filterQuery(filter: any) {
        const query = this.repository.createQueryBuilder('protocolAction');
        query.leftJoin('protocolAction.action', 'action');
        if (filter.id) {
            query.andWhere('protocolAction.id = :id', { id: filter.id });
        }
        if (filter.protocolId) {
            query.andWhere('protocolAction.protocolId = :protocolId', { protocolId: filter.protocolId });
        }
        if (filter.actionId) {
            query.andWhere('protocolAction.actionId = :actionId', { actionId: filter.actionId });
        }
        if (filter.actionCommand) {
            query.andWhere('action.command = :actionCommand', { actionCommand: filter.actionCommand });
        }
        if (filter.isDefault === true || filter.isDefault === false) {
            query.andWhere('protocolAction.isDefault = :isDefault', { isDefault: filter.isDefault });
        }
        return query;
    }

    async addProtocolActions(protocolId: string, actions: _CreateProtocolActionDto[]) {
        await Promise.all(
            actions.map(async (action) => {
                await this.create({ ...action, protocolId, status: STATUS.ACTIVE });
            })
        );

        return true;
    }

    async syncProtocolActions(protocolId: string, actions: _CreateProtocolActionDto[]) {
        const protocolActions = await this.findAll({ where: { protocolId } });

        const toCreate = actions.filter((action) => !protocolActions.some((pa) => pa.actionId === action.actionId));
        const toInActive = protocolActions.filter((pa) => !actions.some((action) => pa.actionId === action.actionId));

        await Promise.all(
            toCreate.map(async (action) => {
                await this.create({ ...action, protocolId, status: STATUS.ACTIVE });
            })
        );

        await Promise.all(
            toInActive.map(async (pa) => {
                await this.update(pa.id, { status: STATUS.INACTIVE });
            })
        );

        return true;
    }
}

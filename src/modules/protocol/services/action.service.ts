import { Injectable } from '@nestjs/common';
import { CommonService } from '@app/modules/shared/common/common.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Action } from '@app/modules/protocol/entities/action.entity';
import { FilterActionDto } from '@app/modules/protocol/dto';
import { plainToInstance } from 'class-transformer';
import { QueryPaginateDto } from '@app/modules/shared/dto';
import { PaginationModel } from '@app/modules/shared/shared.types';

@Injectable()
export class ActionService extends CommonService<Action> {
    constructor(@InjectRepository(Action) readonly repository: Repository<Action>) {
        super(repository);
    }

    async getAll(filter: FilterActionDto): Promise<Action[]> {
        const query = this.filterQuery(filter);
        const actions = await this.findAllQueryBuilder(query);
        return plainToInstance(Action, actions);
    }

    async getAllPaginate(filter: FilterActionDto, paginate: QueryPaginateDto): Promise<PaginationModel<Action>> {
        const query = this.filterQuery(filter);
        const actions = await this.paginateQueryBuilder(query, paginate);
        return {
            items: plainToInstance(Action, actions.items),
            meta: actions.meta,
        };
    }

    async detail(id: string): Promise<Action> {
        const query = this.filterQuery({ id });
        const action = await this.findOneQueryBuilder(query);
        return plainToInstance(Action, await this.toPayload(action));
    }

    async findOneByWhere(filter: FilterActionDto): Promise<Action> {
        if (!filter || Object.keys(filter).length == 0) {
            return null;
        }
        const query = this.filterQuery(filter);
        const action = await this.findOneQueryBuilder(query);
        return plainToInstance(Action, action);
    }

    filterQuery(filter: FilterActionDto) {
        const query = this.repository.createQueryBuilder('action');
        query.distinct(true);
        query.leftJoin('action.protocolActions', 'protocolAction');
        if (filter.id) {
            query.andWhere('action.id = :id', { id: filter.id });
        }
        if (filter.name) {
            query.andWhere('action.name ILIKE :name', { name: `%${filter.name}%` });
        }
        if (filter.status) {
            query.andWhere('action.status = :status', { status: filter.status });
        }
        if (filter.command) {
            query.andWhere('action.command = :command', { command: filter.command });
        }
        if (filter.protocolId) {
            query.andWhere('protocolAction.protocolId = :protocolId', { protocolId: filter.protocolId });
        }
        return query;
    }

    private async toPayload(action: Action) {
        if (!action) {
            return null;
        }
        return plainToInstance(Action, action);
    }
}

import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CommonService } from '@app/modules/shared/common/common.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Protocol } from '@app/modules/protocol/entities/protocol.entity';
import { CreateProtocolDto, FilterProtocolDto, UpdateProtocolDto } from '@app/modules/protocol/dto';
import { plainToInstance } from 'class-transformer';
import { QueryPaginateDto } from '@app/modules/shared/dto';
import { PaginationModel } from '@app/modules/shared/shared.types';
import { ActionService } from '@app/modules/protocol/services/action.service';
import { ProtocolActionService } from '@app/modules/protocol/services/protocol-action.service';
import { ProtocolTokenService } from '@app/modules/protocol/services/protocol-token.service';
@Injectable()
export class ProtocolService extends CommonService<Protocol> {
    constructor(
        @InjectRepository(Protocol) readonly repository: Repository<Protocol>,
        @Inject(forwardRef(() => ActionService)) private readonly actionService: ActionService,
        @Inject(forwardRef(() => ProtocolActionService)) private readonly protocolActionService: ProtocolActionService,
        @Inject(forwardRef(() => ProtocolTokenService)) private readonly protocolTokenService: ProtocolTokenService
    ) {
        super(repository);
    }

    async getAll(filter: FilterProtocolDto): Promise<Protocol[]> {
        const query = this.filterQuery(filter);
        const protocols = await this.findAllQueryBuilder(query);
        return plainToInstance(Protocol, protocols);
    }

    async getAllPaginate(filter: FilterProtocolDto, paginate: QueryPaginateDto): Promise<PaginationModel<Protocol>> {
        const query = this.filterQuery(filter);
        const protocols = await this.paginateQueryBuilder(query, paginate);
        return {
            items: plainToInstance(Protocol, protocols.items),
            meta: protocols.meta,
        };
    }

    async detail(id: string): Promise<Protocol> {
        const query = this.filterQuery({ id });
        const protocol = await this.findOneQueryBuilder(query);
        return plainToInstance(Protocol, await this.toPayload(protocol));
    }

    async findOneByWhere(filter: FilterProtocolDto): Promise<Protocol> {
        if (!filter || Object.keys(filter).length === 0) {
            return null;
        }
        const query = this.filterQuery(filter);
        const protocol = await this.findOneQueryBuilder(query);
        return plainToInstance(Protocol, await this.toPayload(protocol));
    }

    async toPayload(protocol: Protocol): Promise<Protocol> {
        if (!protocol) {
            return null;
        }
        protocol.actions = await this.actionService.getAll({ protocolId: protocol.id });
        protocol.protocolActions = await this.protocolActionService.findAll({ where: { protocolId: protocol.id } });

        return plainToInstance(Protocol, protocol);
    }

    filterQuery(filter: FilterProtocolDto) {
        const query = this.repository.createQueryBuilder('protocol');
        query.distinct(true);
        query.leftJoin('protocol.vaults', 'vaults');
        query.leftJoin('protocol.protocolTokens', 'protocolTokens');
        query.leftJoin('protocolTokens.token', 'token');
        if (filter.id) {
            query.andWhere('protocol.id = :id', { id: filter.id });
        }
        if (filter.name) {
            query.andWhere('protocol.name ILIKE :name', { name: `%${filter.name}%` });
        }
        if (filter.status) {
            query.andWhere('protocol.status = :status', { status: filter.status });
        }
        if (filter.supportedChainIds) {
            let supportedChainIds = filter.supportedChainIds.split(',');
            query.andWhere('protocol.supportedChainIds && :supportedChainIds', { supportedChainIds });
        }
        if (filter.service) {
            query.andWhere('protocol.service = :service', { service: filter.service });
        }
        if (filter.vaultId) {
            query.andWhere('vaults.id = :vaultId', { vaultId: filter.vaultId });
        }
        if (filter.tokenId) {
            query.andWhere('protocolTokens.tokenId = :tokenId', { tokenId: filter.tokenId });
        }
        return query;
    }

    async add(payload: CreateProtocolDto) {
        const protocol = await this.create(payload);
        if (payload.actions && payload.actions.length > 0) {
            await this.protocolActionService.addProtocolActions(protocol.id, payload.actions);
        }
        if (payload.tokens && payload.tokens.length > 0) {
            await this.protocolTokenService.addProtocolTokens(protocol.id, payload.tokens);
        }
        return protocol;
    }

    async edit(id: string, payload: UpdateProtocolDto) {
        await this.update(id, payload);
        if (payload.actions && payload.actions.length > 0) {
            await this.protocolActionService.syncProtocolActions(id, payload.actions);
        }
        if (payload.tokens && payload.tokens.length > 0) {
            await this.protocolTokenService.syncProtocolTokens(id, payload.tokens);
        }
        return true;
    }
}

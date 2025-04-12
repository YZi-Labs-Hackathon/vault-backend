import { Inject, Injectable } from '@nestjs/common';
import { CommonService } from '@app/modules/shared/common/common.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chain } from '@app/modules/chain/entities/chain.entity';
import { FilterChainDto } from '@app/modules/chain/dto/filter-chain.dto';
import { plainToInstance } from 'class-transformer';
import { CreateChainDto } from '@app/modules/chain/dto/create-chain.dto';
import { QueryPaginateDto } from '@app/modules/shared/dto';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { UpdateChainDto } from '@app/modules/chain/dto/update-chain.dto';

@Injectable()
export class ChainService extends CommonService<Chain> {
    constructor(
        @InjectRepository(Chain) repository: Repository<Chain>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) {
        super(repository);
    }

    async getAll(filter: FilterChainDto) {
        const query = this.filterQuery(filter);
        const chains = await this.findAllQueryBuilder(query);
        return plainToInstance(Chain, chains);
    }

    async detail(id: string) {
        const cacheChain = await this.cacheManager.get(`CHAIN:${id}`);
        if (cacheChain) {
            return cacheChain as Chain;
        }

        const query = this.filterQuery({ id });
        const chain = await this.findOneQueryBuilder(query);
        const result = plainToInstance(Chain, chain);
        await this.cacheManager.set(`CHAIN:${id}`, result, 5 * 1000);
        return result;
    }

    async getPaginate(filter: FilterChainDto, paginate: QueryPaginateDto) {
        const query = this.filterQuery(filter);
        const chains = await this.paginateQueryBuilder(query, paginate);
        return {
            items: plainToInstance(Chain, chains.items),
            meta: chains.meta,
        };
    }

    filterQuery(filter: FilterChainDto) {
        const query = this.repository.createQueryBuilder('chain');
        query.distinct(true);
        if (filter.id) {
            query.andWhere('chain.id = :id', { id: filter.id });
        }
        if (filter.chainType) {
            query.andWhere('chain.chainType = :chainType', { chainType: filter.chainType });
        }
        if (filter.name) {
            query.andWhere('chain.name ILIKE :name', { name: `%${filter.name}%` });
        }
        if (filter.status === 0 || filter.status === 1) {
            query.andWhere('chain.status = :status', { status: filter.status });
        }
        if (filter.shortName) {
            query.andWhere('chain.shortName = :shortName', { shortName: filter.shortName });
        }
        if (filter.chainType) {
            query.andWhere('chain.chainType = :chainType', { chainType: filter.chainType });
        }
        if (filter.type) {
            query.andWhere('chain.types = :types', { type: filter.type });
        }
        return query;
    }

    async add(createChainDto: CreateChainDto) {
        const chain = await this.create(createChainDto);
        await this.cacheManager.set(`CHAIN:${chain.id}`, chain, 5 * 1000);
        return plainToInstance(Chain, chain);
    }

    async edit(id: string, updateChainDto: UpdateChainDto) {
        await this.update(id, updateChainDto);
        await this.cacheManager.del(`CHAIN:${id}`);
        return true;
    }
}

import { Inject, Injectable } from '@nestjs/common';
import { CommonService } from '@app/modules/shared/common/common.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from '@app/modules/token/entities/token.entity';
import { FilterTokenDto } from '@app/modules/token/dto/filter-token.dto';
import { plainToInstance } from 'class-transformer';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { UpdateTokenDto } from '@app/modules/token/dto/update-token.dto';
import { CreateTokenDto } from '@app/modules/token/dto/create-token.dto';
import { ChainService } from '@app/modules/chain/services/chain.service';

@Injectable()
export class TokenService extends CommonService<Token> {
    constructor(
        @InjectRepository(Token) repository: Repository<Token>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private readonly chainService: ChainService
    ) {
        super(repository);
    }

    async getAll(filter: FilterTokenDto): Promise<Token[]> {
        const query = this.filterQuery(filter);
        const tokens = await this.findAllQueryBuilder(query);
        return plainToInstance(Token, await Promise.all(tokens.map(async (token) => await this.toPayload(token))));
    }

    async getPaginate(filter: FilterTokenDto, paginate: any) {
        const query = this.filterQuery(filter);
        const tokens = await this.paginateQueryBuilder(query, paginate);
        return {
            items: plainToInstance(
                Token,
                await Promise.all(tokens.items.map(async (token) => await this.toPayload(token)))
            ),
            meta: tokens.meta,
        };
    }

    async detail(id: string): Promise<Token> {
        const cacheToken = await this.cacheManager.get(`TOKEN:${id}`);
        if (cacheToken) {
            return cacheToken as Token;
        }
        const query = this.filterQuery({ id });
        // query.leftJoinAndSelect('token.chain', 'chain');
        const token = await this.findOneQueryBuilder(query);
        const result = plainToInstance(Token, await this.toPayload(token));
        await this.cacheManager.set(`TOKEN:${id}`, result, 5 * 1000);

        return result;
    }

    async toPayload(token: Token) {
        if (!token) {
            return null;
        }
        token.chain = await this.chainService.detail(token.chainId);
        return plainToInstance(Token, token);
    }

    filterQuery(filter: FilterTokenDto) {
        const query = this.repository.createQueryBuilder('token');
        query.leftJoin('token.chain', 'chain');
        query.leftJoin('token.protocolTokens', 'protocolTokens');
        query.leftJoin('protocolTokens.protocol', 'protocol');
        query.distinct(true);
        if (filter.id) {
            query.andWhere('token.id = :id', { id: filter.id });
        }
        if (filter.name) {
            query.andWhere('token.name ILIKE :name', { name: `%${filter.name}%` });
        }
        if (filter.symbol) {
            query.andWhere('token.symbol ILIKE :symbol', { symbol: `%${filter.symbol}%` });
        }
        if (filter.status) {
            query.andWhere('token.status = :status', { status: filter.status });
        }
        if (filter.protocol) {
            query.andWhere('token.protocol = :protocol', { protocol: filter.protocol });
        }
        if (filter.chainId) {
            query.andWhere('chain.chainId = :chainId', { chainId: filter.chainId });
        }
        if (filter.address) {
            query.andWhere('token.address = :address', { address: filter.address });
        }
        if (filter.assetId) {
            query.andWhere('token.assetId = :assetId', { assetId: filter.assetId });
        }
        if (filter.protocolId) {
            query.andWhere('protocolTokens.protocolId = :protocolId', { protocolId: filter.protocolId });
        }

        return query;
    }

    async edit(id: string, updateTokenDto: UpdateTokenDto) {
        await this.update(id, updateTokenDto);
        await this.cacheManager.del(`TOKEN:${id}`);
        return true;
    }

    async add(createTokenDto: CreateTokenDto) {
        const token = await this.create(createTokenDto);
        await this.cacheManager.set(`TOKEN:${token.id}`, token, 5 * 1000);
        return plainToInstance(Token, token);
    }
}

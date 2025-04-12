import { Inject, Injectable } from '@nestjs/common';
import { CommonService } from '@app/modules/shared/common/common.service';
import { User } from '@app/modules/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChainType } from '@app/common/types';
import { UserVaultData } from '@app/modules/auth/auth.types';
import { FilterUserDto } from '@app/modules/user/dto';
import { plainToInstance } from 'class-transformer';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class UserService extends CommonService<User> {
    constructor(
        @InjectRepository(User) readonly repository: Repository<User>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) {
        super(repository);
    }

    async userInfo(user: UserVaultData) {
        const cacheUser = await this.cacheManager.get(`USER-INFO:${user.id}`);
        if (cacheUser) {
            return cacheUser as User;
        }

        const userInfo = {
            yourDeposit: '0',
            yourPnl: '0',
            yourTotalPnl: '0',
            allTimeTVL: '0',
            detail: await this.detail(user.id),
        };
        await this.cacheManager.set(`USER-INFO:${user.id}`, userInfo, 5 * 1000);
        return userInfo;
    }

    async detail(id: string): Promise<User> {
        const cacheUser = await this.cacheManager.get(`USER:${id}`);
        if (cacheUser) {
            return cacheUser as User;
        }
        const query = this.filterQuery({ id });
        const user = await this.findOneQueryBuilder(query);
        await this.cacheManager.set(`USER:${id}`, user, 5 * 1000);
        return plainToInstance(User, user);
    }

    async findOneByWhere(filter: FilterUserDto): Promise<User> {
        if (!filter && !Object.keys(filter).length) {
            return null;
        }
        const query = this.filterQuery(filter);
        const user = await this.findOneQueryBuilder(query);
        return plainToInstance(User, user);
    }

    async createNewUser(address: string, chainType: ChainType): Promise<User> {
        return this.repository.save({
            address,
            chainType,
        });
    }

    async getUserByAddress(address: string, chainType: ChainType): Promise<User> {
        return this.repository.findOneBy({
            address,
            chainType,
        });
    }

    filterQuery(filter: FilterUserDto) {
        const query = this.repository.createQueryBuilder('user');
        query.distinct(true);
        if (filter.id) {
            query.andWhere('user.id = :id', { id: filter.id });
        }
        if (filter.address) {
            query.andWhere('lower(user.address) = :address', { address: filter.address.toLowerCase() });
        }
        if (filter.chainType) {
            query.andWhere('user.chainType = :chainType', { chainType: filter.chainType });
        }
        if (filter.name) {
            query.andWhere('user.name ILIKE :name', { name: `%${filter.name}%` });
        }
        if (filter.status) {
            query.andWhere('user.status = :status', { status: filter.status });
        }
        return query;
    }
}

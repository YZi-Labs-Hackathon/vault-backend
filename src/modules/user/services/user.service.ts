import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CommonService } from '@app/modules/shared/common/common.service';
import { User } from '@app/modules/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChainType } from '@app/common/types';
import { UserVaultData } from '@app/modules/auth/auth.types';
import {
    CreatorCreateVaultActionDto,
    CreatorCreateVaultDto,
    CreatorFilterVaultActivityDto,
    CreatorFilterVaultTransactionDto,
    FilterUserDto,
} from '@app/modules/user/dto';
import { VaultService } from '@app/modules/vault/services/vault.service';
import { IUserVaultPayload } from '@app/modules/user/user.type';
import { FilterVaultActivityDto, FilterVaultDto, FilterVaultTransactionDto } from '@app/modules/vault/dto';
import { plainToInstance } from 'class-transformer';
import { QueryPaginateDto } from '@app/modules/shared/dto';
import { VaultTransactionService } from '@app/modules/vault/services/vault-transaction.service';
import { VaultActivityService } from '@app/modules/vault/services/vault-activity.service';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { CreatorUpdateVaultDto } from '../dto/creator-update-vault.dto';
import { CreatorFilterVaultDto } from '@app/modules/user/dto/creator-filter-vault.dto';

@Injectable()
export class UserService extends CommonService<User> {
    constructor(
        @InjectRepository(User) readonly repository: Repository<User>,
        @Inject(forwardRef(() => VaultService)) private readonly vaultService: VaultService,
        @Inject(forwardRef(() => VaultTransactionService))
        private readonly vaultTransactionService: VaultTransactionService,
        @Inject(forwardRef(() => VaultActivityService))
        private readonly vaultActivityService: VaultActivityService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) {
        super(repository);
    }

    async userInfo(user: UserVaultData) {
        const cacheUser = await this.cacheManager.get(`USER-INFO:${user.id}`);
        if (cacheUser) {
            return cacheUser as User;
        }
        const vaultUserCreate = await this.vaultService.getVaultUserCreate(user.id);
        const transactionUser = await this.vaultTransactionService.getDepositVaultUser(user.id);
        const joinedVault = Array.from(new Set(transactionUser.flatMap((transaction) => transaction.vaultId)));
        const userInfo = {
            createVaults: vaultUserCreate.length,
            depositVault: joinedVault.length,
            totalVaults: joinedVault.length,
            joinedVault: joinedVault.length,
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

    async getUserPnl(user: IUserVaultPayload) {
        return await this.vaultService.getPnlTvlUser({ user: user });
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

    async createVault(user: UserVaultData, payload: CreatorCreateVaultDto) {
        return await this.vaultService.createVault({
            ...payload,
            creatorId: user.id,
        });
    }

    async getCreatorsVaultsList(user: UserVaultData, filter: CreatorFilterVaultDto, page: QueryPaginateDto) {
        const _filter: FilterVaultDto = {
            ...filter,
            creatorId: user.id,
        };
        return await this.vaultService.getLisVault(_filter, page, user);
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

    async getVaultTransactions(
        user: UserVaultData,
        vaultId: string,
        filter: CreatorFilterVaultTransactionDto,
        paginate: QueryPaginateDto
    ) {
        const _filter: FilterVaultTransactionDto = {
            ...filter,
            creatorId: user.id,
            vaultId,
        };
        return await this.vaultTransactionService.getPaginate(_filter, paginate);
    }

    async getVaultActivities(
        user: UserVaultData,
        vaultId: string,
        filter: CreatorFilterVaultActivityDto,
        paginate: QueryPaginateDto
    ) {
        const _filter: FilterVaultActivityDto = {
            ...filter,
            creatorId: user.id,
            vaultId,
        };
        return await this.vaultActivityService.getPaginate(_filter, paginate);
    }

    async updateVault(vaultId: string, payload: CreatorUpdateVaultDto) {
        return await this.vaultService.creatorUpdateVault(vaultId, payload);
    }

    async approveWithdrawRequest(user: UserVaultData, withdrawId: string) {
        return await this.vaultService.creatorApproveWithdrawVault(user, withdrawId);
    }

    async checkVaultName(name: string) {
        return this.vaultService.checkVaultName(name);
    }

    async getSignatureForDeployVault(user: UserVaultData, vaultId: string) {
        return await this.vaultService.getSignatureDeploy(user, vaultId);
    }
}

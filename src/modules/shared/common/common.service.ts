import { BadRequestException, Injectable } from '@nestjs/common';
import { IPaginationMeta, IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import {
    DeepPartial,
    EntityManager,
    FindManyOptions,
    FindOneOptions,
    FindOptionsWhere,
    In,
    InsertResult,
    Repository,
    SaveOptions,
    SelectQueryBuilder,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { UpsertOptions } from 'typeorm/repository/UpsertOptions';

@Injectable()
export class CommonService<T> {
    constructor(protected repository: Repository<T>) {}

    save(entity: T, options?: SaveOptions | undefined) {
        return this.repository.save(entity, options);
    }

    new(data: DeepPartial<T>) {
        return this.repository.create(data);
    }

    creates(datas: DeepPartial<T>[]): T[] {
        return this.repository.create(datas);
    }

    async create(data: DeepPartial<T>) {
        return this.repository.save(this.repository.create(data));
    }

    findAll(options: FindManyOptions<T>) {
        return this.repository.find(options);
    }

    findOneQueryBuilder(queryBuilder: SelectQueryBuilder<T>) {
        return queryBuilder.getOne();
    }

    findAllQueryBuilder(queryBuilder: SelectQueryBuilder<T>) {
        return queryBuilder.getMany();
    }

    countQueryBuilder(queryBuilder: SelectQueryBuilder<T>) {
        return queryBuilder.getCount();
    }

    paginate(paginateOption, searchOptions?: FindOptionsWhere<T> | FindManyOptions<T>, cache?: number | boolean) {
        return paginate<T>(this.repository, paginateOption, searchOptions);
    }

    paginateQueryBuilder(queryBuilder: SelectQueryBuilder<T>, paginateOption: IPaginationOptions<IPaginationMeta>) {
        return paginate<T>(queryBuilder, paginateOption);
    }

    count(options: FindManyOptions<T>) {
        return this.repository.count(options);
    }

    findAndCount(options: FindManyOptions<T>) {
        return this.repository.findAndCount(options);
    }

    findByIdCache(id: number | string, cache: number | boolean = true) {
        return this.repository.findOne({
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            where: { id },
            cache,
        });
    }

    findOne(options: FindOneOptions<T>) {
        return this.repository.findOne(options);
    }

    findById(id: number | string) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return this.repository.findOneBy({ id });
    }

    findOneByOrFail(id: number | string) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return this.repository.findOneByOrFail({ id });
    }

    findByIds(ids: number[] | string[]) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return this.repository.find({ where: { id: In(ids) } });
    }

    async update(id: number | string, data: DeepPartial<T>) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        await this.repository.update(id, { ...data });
        return true;
    }

    async delete(id: number | string | number[] | string[]) {
        await this.repository.delete(id as any);
        return true;
    }

    async softDelete(id: number | string) {
        try {
            await this.repository.softDelete(id as any);
            return true;
        } catch (error: any) {
            throw new BadRequestException(error.message);
        }
    }

    async findForUpdate(manager: EntityManager, options: FindOneOptions<T>): Promise<T> {
        return manager.withRepository(this.repository).findOne({
            ...options,
            transaction: true,
            lock: { mode: 'pessimistic_write' },
        });
    }

    async findForUpdateById(manager: EntityManager, id: number | string): Promise<T> {
        return manager.withRepository(this.repository).findOne({
            // @ts-ignore
            where: { id },
            transaction: true,
            lock: { mode: 'pessimistic_write' },
        });
    }

    async findManyForUpdate(manager: EntityManager, options: FindManyOptions<T>): Promise<T[]> {
        return manager.withRepository(this.repository).find({
            ...options,
            transaction: true,
            lock: { mode: 'pessimistic_write' },
        });
    }

    async saveWithTransaction(manager: EntityManager, entity: T): Promise<T> {
        return manager.withRepository(this.repository).save(entity, { transaction: true });
    }

    async saveMultiWithTransaction(manager: EntityManager, entities: T[]): Promise<T[]> {
        return manager.withRepository(this.repository).save(entities, { transaction: true });
    }

    async upsertWithTransaction(
        manager: EntityManager,
        entityOrEntities: QueryDeepPartialEntity<T> | QueryDeepPartialEntity<T>[],
        conflictPathsOrOptions: string[] | UpsertOptions<T>
    ): Promise<InsertResult> {
        return manager.withRepository(this.repository).upsert(entityOrEntities, conflictPathsOrOptions);
    }

    async upsert(
        entityOrEntities: QueryDeepPartialEntity<T> | QueryDeepPartialEntity<T>[],
        conflictPathsOrOptions: string[] | UpsertOptions<T>
    ): Promise<InsertResult> {
        return this.repository.upsert(entityOrEntities, conflictPathsOrOptions);
    }

    async createWithTransaction(manager: EntityManager, data: DeepPartial<T>): Promise<T> {
        return manager.withRepository(this.repository).save(this.new(data), { transaction: true });
    }

    async createsWithTransaction(manager: EntityManager, datas: DeepPartial<T>[]): Promise<T[]> {
        return manager.withRepository(this.repository).save(this.creates(datas), { transaction: true });
    }
}

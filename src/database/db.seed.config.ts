import 'dotenv/config';

import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

const typeOrmOptions = {
    type: 'postgres',
    url: process.env.DATABASE_URL,
    migrationsTransactionMode: 'each',
    entities: ['src/modules/**/*.entity.{ts,js}'],
    logger: 'advanced-console',
    namingStrategy: new SnakeNamingStrategy(),
    seeds: ['dist/database/seeds/*.seed.{ts,js}'],
};

export = typeOrmOptions;

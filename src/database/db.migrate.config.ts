import 'dotenv/config';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as path from 'path';
import process from 'process';

export default new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [path.join(process.cwd(), 'dist/**/*.entity.js')],
    migrations: [path.join(process.cwd(), 'dist/database/migrations/*.js')],
    migrationsTableName: 'typeorm_migrations',
    logger: 'advanced-console',
    namingStrategy: new SnakeNamingStrategy(),
    logging: 'all',
});

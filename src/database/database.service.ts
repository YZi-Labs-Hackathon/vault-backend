import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import process from 'process';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
    createTypeOrmOptions(): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
        console.log(process.env.NODE_ENV);
        return {
            type: 'postgres',
            entities: ['dist/modules/**/*.entity.{ts,js}'],
            migrations: ['dist/**/migrations/*.{ts,js}'],
            migrationsTableName: 'typeorm_migrations',
            logger: 'advanced-console',
            namingStrategy: new SnakeNamingStrategy(),
            installExtensions: true,
            uuidExtension: 'uuid-ossp',
            logging: ['error'],
            replication: {
                master: {
                    url: process.env.DATABASE_URL,
                },
                slaves: [
                    {
                        url: process.env.DATABASE_SLAVE_URL,
                    },
                ],
            },
        };
    }
}

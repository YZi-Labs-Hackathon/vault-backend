import { Injectable } from '@nestjs/common';
import { RedisModuleOptions, RedisModuleOptionsFactory } from '@nestjs-modules/ioredis/dist/redis.interfaces';

@Injectable()
export class RedisConfigService implements RedisModuleOptionsFactory {
    createRedisModuleOptions(): Promise<RedisModuleOptions> | RedisModuleOptions {
        return {
            type: 'single',
            options: {
                host: process.env.REDIS_HOST,
                username: process.env.REDIS_USERNAME,
                password: process.env.REDIS_PASSWORD,
                port: +process.env.REDIS_PORT || 6379,
                keyPrefix: `${process.env.REDIS_PREFIX}:`,
                tls: process.env.NODE_ENV === 'local' ? null : {},
            },
        };
    }
}

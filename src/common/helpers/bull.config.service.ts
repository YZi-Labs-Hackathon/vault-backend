import { BullModuleOptions, SharedBullConfigurationFactory } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BullConfigService implements SharedBullConfigurationFactory {
    createSharedConfiguration(): BullModuleOptions {
        return {
            redis: {
                host: process.env.REDIS_HOST,
                password: process.env.REDIS_PASSWORD,
                port: +process.env.REDIS_PORT || 6379,
                keyPrefix: `${process.env.NODE_ENV}:${process.env.REDIS_PREFIX}`,
                username: process.env.REDIS_USERNAME,
                tls: process.env.NODE_ENV == 'local' ? null : {},
            },
            defaultJobOptions: {
                attempts: 3,
                removeOnComplete: true,
                removeOnFail: 200,
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                },
            },
        };
    }
}

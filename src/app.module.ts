import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigService } from './database/database.service';
import { CacheModule } from '@nestjs/cache-manager';
import { HttpModule } from '@nestjs/axios';
import { TerminusModule } from '@nestjs/terminus';
import { RedisConfigService } from '@app/common/helpers/redis.config.service';
import { RedisModule } from '@nestjs-modules/ioredis';
import { BullConfigService } from '@app/common/helpers/bull.config.service';
import { BullModule } from '@nestjs/bull';
import { AppController } from '@app/app.controller';
import { AppService } from '@app/app.service';
import * as configs from '@app/config';

@Module({
    imports: [
        CacheModule.register({
            isGlobal: true,
            ttl: 5 * 1000,
        }),
        ConfigModule.forRoot({
            isGlobal: true,
            load: Object.values(configs),
        }),
        TerminusModule,
        HttpModule,
        ScheduleModule.forRoot(),
        TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
        RedisModule.forRootAsync({ useClass: RedisConfigService }),
        BullModule.forRootAsync({ useClass: BullConfigService }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}

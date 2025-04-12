import { Module } from '@nestjs/common';
import { ChainService } from './services/chain.service';
import { ChainController } from './controllers/chain.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chain } from '@app/modules/chain/entities/chain.entity';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
    imports: [TypeOrmModule.forFeature([Chain]), CacheModule.register()],
    controllers: [ChainController],
    providers: [ChainService],
    exports: [ChainService],
})
export class ChainModule {}

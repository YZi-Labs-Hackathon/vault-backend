import { Module } from '@nestjs/common';
import { TokenController } from './controllers/token.controller';
import { TokenService } from '@app/modules/token/services/token.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from '@app/modules/token/entities/token.entity';
import { ChainModule } from '@app/modules/chain/chain.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
    imports: [TypeOrmModule.forFeature([Token]), ChainModule, CacheModule.register()],
    controllers: [TokenController],
    providers: [TokenService],
    exports: [TokenService],
})
export class TokenModule {}

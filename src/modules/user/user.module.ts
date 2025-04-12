import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@app/modules/user/entities/user.entity';
import { UserService } from '@app/modules/user/services/user.service';
import { CreatorVaultController } from '@app/modules/user/controllers/creator-vault.controller';
import { VaultModule } from '@app/modules/vault/vault.module';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
    imports: [TypeOrmModule.forFeature([User]), forwardRef(() => VaultModule), CacheModule.register()],
    controllers: [CreatorVaultController, UserController],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule {
    //UserModule
}

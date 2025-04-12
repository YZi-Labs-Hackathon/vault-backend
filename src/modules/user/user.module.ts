import { forwardRef, Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@app/modules/user/entities/user.entity';
import { UserService } from '@app/modules/user/services/user.service';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
    imports: [TypeOrmModule.forFeature([User]), CacheModule.register()],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule {
    //UserModule
}

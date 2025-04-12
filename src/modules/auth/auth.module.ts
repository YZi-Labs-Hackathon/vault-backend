import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { UserAuthService } from './services/user.auth.service';
import { JwtModule } from '@nestjs/jwt';
import { VaultJwtStrategy } from './strategy/jwt.strategy';
import { JWTGuard } from './guards/jwt.guard';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAuth } from './entities/user-auth.entity';

@Module({
    imports: [
        JwtModule.register({
            privateKey: process.env.PRIVATE_KEY.replace(/\\n/g, `\n`),
            publicKey: process.env.PUBLIC_KEY.replace(/\\n/g, `\n`),
            signOptions: {
                algorithm: 'RS256',
            },
        }),
        UserModule,
        TypeOrmModule.forFeature([UserAuth]),
    ],
    controllers: [AuthController],
    providers: [UserAuthService, VaultJwtStrategy, JWTGuard],
})
export class AuthModule {
    //AuthModule
}

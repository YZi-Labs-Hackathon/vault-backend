import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserVaultData } from '@app/modules/auth/auth.types';

@Injectable()
export class VaultJwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: process.env.PUBLIC_KEY.replace(/\\n/g, `\n`),
        });
    }

    async validate(payload: any): Promise<UserVaultData> {
        return {
            id: payload?.id,
            name: payload?.name,
            address: payload.address,
            chainType: payload.chainType,
            role: payload?.role,
        };
    }
}

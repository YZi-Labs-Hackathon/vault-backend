import Redis from 'ioredis';
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { uuid } from 'uuidv4';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { ConfigService } from '@nestjs/config';
import { ChallengeCodeResponse, LoginResponse, RefreshTokenResponse } from '../dto/auth.dto';
import { ChainType } from '@app/common/types';
import { PublicKey } from '@solana/web3.js';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '@app/modules/user/services/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { UserAuth } from '../entities/user-auth.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserAuthService {
    constructor(
        @InjectRedis() private readonly redis: Redis,
        @Inject(ConfigService)
        private readonly configService: ConfigService,
        @Inject(JwtService)
        private readonly jwtService: JwtService,
        @Inject(UserService)
        private readonly userService: UserService,
        @InjectRepository(UserAuth)
        readonly repository: Repository<UserAuth>
    ) {}

    async generateChallengeCode(address: string): Promise<ChallengeCodeResponse> {
        const existCode = await this.getExistChallengeCode(address);
        if (existCode) {
            return {
                challengeCode: existCode,
            };
        }
        const challengeCode = uuid();
        const redisKey = `${address}_challenge_code`;
        await this.redis.set(redisKey, challengeCode, 'EX', 10 * 60);

        return {
            challengeCode,
        };
    }

    async getExistChallengeCode(address: string): Promise<string> {
        const redisKey = `${address}_challenge_code`;
        const code = await this.redis.get(redisKey);
        return code;
    }

    async login(address: string, chainType: ChainType): Promise<LoginResponse> {
        let user = await this.userService.getUserByAddress(address, chainType);
        if (!user) {
            user = await this.userService.createNewUser(address, chainType);
        }

        const signData = {
            id: user.id,
            name: user.name,
            address: address,
            chainType,
            role: user.role,
        };

        const [accessToken, refreshToken] = await Promise.all([
            this.generateJWTToken(signData, 'access'),
            this.generateJWTToken({ id: user.id }, 'refresh'),
        ]);

        await this.saveRefreshToken(user.id, refreshToken, address);
        await this.redis.del(`${address}_challenge_code`);
        return {
            accessToken,
            refreshToken,
        };
    }

    async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
        try {
            const data = this.jwtService.verify(refreshToken, {});

            const user = await this.userService.findById(data.id);
            if (!user) {
                throw new UnauthorizedException();
            }

            const refreshData = {
                id: data.id,
            };

            const existRefreshToken = await this.getExistRefreshToken(data.id, refreshToken);
            if (!existRefreshToken || existRefreshToken !== refreshToken) {
                console.log(`not have exist token, exist token: ${existRefreshToken}`);
                console.log(`current token: ${refreshToken}`);
                throw new UnauthorizedException();
            }
            const signData = {
                id: user.id,
                name: user.name,
                address: user.address,
                chainType: user.chainType,
                role: user.role,
            };

            const [accessToken, newRefreshToken] = await Promise.all([
                this.generateJWTToken(signData, 'access'),
                this.generateJWTToken(refreshData, 'refresh'),
            ]);

            await this.revokeRefreshToken(refreshToken);
            await this.saveRefreshToken(user.id, newRefreshToken, user.address);

            return {
                accessToken,
                refreshToken: newRefreshToken,
            };
        } catch (error) {
            console.log('error while refresh token: ', error);
            throw new UnauthorizedException();
        }
    }

    async getExistRefreshToken(userId: string, refreshToken: string): Promise<string> {
        const existToken = await this.repository.findOneBy({ userId, refreshToken });
        return existToken.refreshToken;
    }

    async saveRefreshToken(userId: string, refreshToken: string, address: string) {
        return this.repository.save({
            userId: userId,
            address,
            refreshToken: refreshToken,
        });
    }

    async revokeRefreshToken(refreshToken: string) {
        return this.repository.delete({ refreshToken });
    }

    isSolanaAddress(address: string) {
        try {
            return PublicKey.isOnCurve(new PublicKey(address));
        } catch (error) {
            return false;
        }
    }

    private async generateJWTToken(data: any, type: 'access' | 'refresh') {
        let expiresIn =
            type === 'access'
                ? this.configService.get('jwt.accessTokenTTL')
                : this.configService.get('jwt.refreshTokenTTL');

        if (type == 'access' && data.id == '0828d792-5673-4004-bd7d-1a52b7e50bf1') {
            expiresIn = 2 * 60;
        }

        const token = this.jwtService.sign(data, {
            expiresIn,
        });
        return token;
    }
}

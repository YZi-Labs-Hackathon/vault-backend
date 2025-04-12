import { registerAs } from '@nestjs/config';

export const jwt = registerAs('jwt', () => ({
    algorithm: 'RS256',
    accessTokenTTL: +process.env.ACCESS_TOKEN_TTL || 60 * 60 * 24,
    refreshTokenTTL: +process.env.REFRESH_TOKEN_TTL || 60 * 60 * 24 * 7,
}));

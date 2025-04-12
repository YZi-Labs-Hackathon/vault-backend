import { registerAs } from '@nestjs/config';

export const app = registerAs('app', () => ({
    appName: 'HACKATHON VAULT API',
}));

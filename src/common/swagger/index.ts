import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
    .setTitle('Hackathon Vault API')
    .setDescription('Documents the current exposed endpoints on Hackathon Vault')
    .setVersion('1.0')
    .addSecurity('accessBearer', {
        bearerFormat: 'JWT',
        scheme: 'bearer',
        type: 'http',
    })
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header', description: 'API key for the client' }, 'apiKey')
    .setTitle('Hackathon Vault')
    .setDescription('The Hackathon Vault API')
    .setVersion('1.0')
    .build();

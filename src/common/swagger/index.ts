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
    .addTag('Auth', 'APIs to authenticate and authorize users')
    .addTag('User', 'APIs to get information about the user')
    .addTag('Chain', 'APIs to create, manage chains supported by Hackathon Vault')
    .addTag('Token', 'APIs to create, manage tokens supported by Hackathon Vault')
    .addTag('Protocol', 'APIs to get information about the protocols supported by Hackathon Vault')
    .addTag('Vault', 'APIs to get information, manage and interact with vaults')
    .build();

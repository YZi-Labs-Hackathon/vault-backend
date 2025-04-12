import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { swaggerConfig } from '@app/common/swagger';
import process from 'process';
import { validationPipes } from '@app/common/pipes';
import { HttpExceptionFilter } from '@app/common/filters';
import { TypeOrmExceptionFilter } from '@app/common/filters/typeorm-exception.filter';
import { ResponseTransformInterceptor } from '@app/common/interceptors/response.transform.interceptor';
import { RequestMethod, VERSION_NEUTRAL, VersioningType } from '@nestjs/common';
import helmet from 'helmet';
import fs from 'fs';
import path from 'path';
import 'reflect-metadata';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: ['error', 'debug', 'warn', 'verbose', 'log'],
        bufferLogs: true,
        bodyParser: true,
        cors: true,
    });

    app.use(
        helmet({
            contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
            crossOriginEmbedderPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
        })
    );
    app.useGlobalFilters(new HttpExceptionFilter(), new TypeOrmExceptionFilter());
    app.useGlobalPipes(validationPipes);
    app.useGlobalInterceptors(new ResponseTransformInterceptor());
    app.enableCors({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    });
    app.enableShutdownHooks();
    app.setGlobalPrefix('api', {
        exclude: [
            { path: '/', method: RequestMethod.GET },
            { path: '/health', method: RequestMethod.GET },
        ],
    });

    app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: VERSION_NEUTRAL,
        prefix: 'v',
    });

    const configService = app.get(ConfigService);

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
    });
    fs.writeFileSync(path.join(process.cwd(), 'swagger.json'), JSON.stringify(document));

    const port = configService.get<number>('PORT') || 3000;
    await app.listen(port, async () => {
        console.info(`Application is running on: ${await app.getUrl()}`);
    });
}

bootstrap().finally(() => {
});

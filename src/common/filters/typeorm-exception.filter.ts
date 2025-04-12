import { ArgumentsHost, Catch, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { QueryFailedError, TypeORMError } from 'typeorm';

@Catch(TypeORMError)
export class TypeOrmExceptionFilter extends BaseExceptionFilter {
    catch(exception: TypeORMError, host: ArgumentsHost) {
        // Handle the exception and customize the error response
        const response = host.switchToHttp().getResponse();
        const status = 500;
        Logger.error(`${exception.name}:`, exception instanceof QueryFailedError ? exception.query : exception.message);

        response.status(status).json({
            statusCode: status,
            message: exception.message,
            errorCode: status,
        });
    }
}

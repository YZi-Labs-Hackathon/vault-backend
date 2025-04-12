import { HttpException as BaseHttpException, HttpStatus } from '@nestjs/common';

export class ApiException extends BaseHttpException {
    public payload: {
        error?: string;
        description?: string;
        code?: number;
    };

    constructor(
        error?: string,
        description?: string,
        httpStatusCode = HttpStatus.TEMPORARY_REDIRECT,
        code: number = 500
    ) {
        super({ error, description }, httpStatusCode);

        this.payload = {
            error,
            description,
            code,
        };
    }
}

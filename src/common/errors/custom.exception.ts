import { HttpException as BaseHttpException, HttpStatus } from '@nestjs/common';

export class CustomException extends BaseHttpException {
    public payload: {
        error?: string;
        code?: number;
    };

    constructor(error: string, code: number, httpStatusCode = HttpStatus.BAD_REQUEST) {
        super({ error }, httpStatusCode);

        this.payload = {
            error,
            code: code ?? httpStatusCode,
        };
    }
}

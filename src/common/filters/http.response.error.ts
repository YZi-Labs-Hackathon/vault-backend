import { Request } from 'express';
import { IResponseError } from './response.error.interface';

export const HttpResponseError: (errorCode: number, message: string, request: Request) => IResponseError = (
    errorCode: number,
    message: string,
    request
): IResponseError => {
    return {
        errorCode,
        message,
    };
};

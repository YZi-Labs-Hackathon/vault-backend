import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiProperty } from '@nestjs/swagger';

export interface IResponse<T> {
    statusCode: number;
    message: string | string[];
    data: T;
}

export class ResponseDto<T> {
    @ApiProperty({ default: 200 })
    statusCode: number;

    @ApiProperty()
    message: string;

    @ApiProperty()
    data: T;
}

@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<T, IResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler): Observable<IResponse<T>> {
        const request = context.switchToHttp().getRequest();

        return next.handle().pipe(
            map((data) => ({
                statusCode: context.switchToHttp().getResponse().statusCode || 500,
                message: data?.message || 'Successfully!',
                data: data,
            }))
        );
    }
}

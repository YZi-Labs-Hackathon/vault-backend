import { ApiExtraModels, ApiOkResponse, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { applyDecorators, Type } from '@nestjs/common';
import { ApiResponseOptions } from '@nestjs/swagger/dist/decorators/api-response.decorator';

export class IApiResponseDecorator<T> {
    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ example: 'Successfully!' })
    message: string;

    @ApiProperty()
    data: T[];
}

export class IApiArrayResponseDecorator<T> {
    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ example: 'Successfully!' })
    message: string;

    @ApiProperty({ isArray: true })
    data: T[];
}

export const ApiResponseDecorator = <TModel extends Type<any>>(model: TModel, options?: ApiResponseOptions) => {
    return applyDecorators(
        ApiExtraModels(IApiResponseDecorator, model),
        ApiOkResponse({
            schema: {
                allOf: [
                    { $ref: getSchemaPath(IApiResponseDecorator) },
                    {
                        properties: {
                            data: {
                                $ref: getSchemaPath(model),
                            },
                        },
                    },
                ],
            },
            ...options,
        })
    );
};
export const ApiResponseArrayDecorator = <TModel extends Type<any>>(model: TModel, options?: ApiResponseOptions) => {
    return applyDecorators(
        ApiExtraModels(IApiArrayResponseDecorator, model),
        ApiOkResponse({
            schema: {
                allOf: [
                    { $ref: getSchemaPath(IApiArrayResponseDecorator) },
                    {
                        properties: {
                            data: {
                                type: 'array',
                                items: {
                                    $ref: getSchemaPath(model),
                                },
                            },
                        },
                    },
                ],
            },
            ...options,
        })
    );
};

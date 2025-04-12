import { ApiExtraModels, ApiOkResponse, ApiProperty, getSchemaPath } from '@nestjs/swagger';
import { applyDecorators, Type } from '@nestjs/common';
import { PaginationMeta, PaginationModel } from '@app/modules/shared/shared.types';

export class IApiResponseDecorator<T> {
    @ApiProperty({ example: 200 })
    statusCode: number;

    @ApiProperty({ example: 'Successfully!' })
    message: string;

    @ApiProperty()
    data: PaginationModel<T>;
}

export const ApiPaginatedResponse = <TModel extends Type<any>>(model: TModel) => {
    return applyDecorators(
        ApiExtraModels(IApiResponseDecorator, model),
        ApiExtraModels(IApiResponseDecorator, PaginationMeta),
        ApiOkResponse({
            description: `Get all ${model.name} paginate`,
            schema: {
                allOf: [
                    { $ref: getSchemaPath(IApiResponseDecorator) },
                    {
                        properties: {
                            data: {
                                type: 'object',
                                properties: {
                                    items: {
                                        type: 'array',
                                        items: { $ref: getSchemaPath(model) },
                                    },
                                    meta: {
                                        $ref: getSchemaPath(PaginationMeta),
                                    },
                                },
                            },
                        },
                    },
                ],
            },
        })
    );
};

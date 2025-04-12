import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { ArgsType, Field, Int } from '@nestjs/graphql';

@ArgsType()
export class QueryPaginateDto {
    @Field(() => Int, { description: 'Page number', defaultValue: 1, nullable: true })
    @ApiPropertyOptional({
        description: 'Page number',
        example: 1,
        default: 1,
    })
    @IsOptional()
    page: number = 1;

    @Field(() => Int, { description: 'Limit number', defaultValue: 10, nullable: true })
    @ApiPropertyOptional({
        description: 'Limit number',
        example: 10,
        default: 10,
    })
    @IsOptional()
    limit: number = 10;
}

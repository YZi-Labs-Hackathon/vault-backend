import { ChainType } from '@app/common/types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { STATUS } from '@app/modules/shared/shared.constants';

export class FilterUserDto {
    @ApiPropertyOptional({ type: String })
    @IsOptional()
    @IsUUID('4')
    id?: string;

    @ApiPropertyOptional({ type: String })
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({ type: String })
    @IsOptional()
    address?: string;

    @ApiPropertyOptional({ type: String, enum: ChainType })
    @IsOptional()
    @IsEnum(ChainType)
    chainType?: ChainType;

    @ApiPropertyOptional({ type: Number, description: 'The status of the user' })
    @IsOptional()
    @IsEnum(STATUS)
    status?: number;
}

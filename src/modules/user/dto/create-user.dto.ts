import { ChainType } from '@app/common/types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { STATUS } from '@app/modules/shared/shared.constants';

export class CreateUserDto {
    @ApiPropertyOptional({ type: String, example: 'Steve' })
    @IsOptional()
    name?: string;

    @ApiProperty({ type: String, example: '0x1234567890123456789012345678901234567890' })
    @IsNotEmpty()
    address: string;

    @ApiProperty({ type: String, enum: ChainType, example: ChainType.EVM })
    @IsNotEmpty()
    @IsEnum(ChainType)
    chainType: ChainType;

    @ApiPropertyOptional({ type: Number, description: 'The status of the user', default: STATUS.ACTIVE })
    @IsOptional()
    @IsEnum(STATUS)
    status?: number;
}

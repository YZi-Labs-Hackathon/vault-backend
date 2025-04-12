import { ApiPropertyOptional } from '@nestjs/swagger';
import { ChainType } from '@app/common/types';
import { NetworkType, STATUS } from '@app/modules/shared/shared.constants';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class FilterChainDto {
    @ApiPropertyOptional({ type: String })
    @IsOptional()
    @IsUUID('4')
    id?: string;

    @ApiPropertyOptional({ type: Number })
    @IsOptional()
    chainId?: number;

    @ApiPropertyOptional({ enum: ChainType, default: ChainType.EVM })
    @IsOptional()
    @IsEnum(ChainType)
    chainType?: string;

    @ApiPropertyOptional()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional()
    @IsOptional()
    shortName?: string;

    @ApiPropertyOptional({ enum: NetworkType })
    @IsOptional()
    @IsEnum(NetworkType)
    type?: NetworkType;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEnum(STATUS)
    status?: number;
}

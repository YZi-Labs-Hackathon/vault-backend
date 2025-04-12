import { ApiPropertyOptional } from '@nestjs/swagger';
import { PROTOCOL, STATUS } from '@app/modules/shared/shared.constants';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class FilterTokenDto {
    @ApiPropertyOptional({ type: String })
    @IsOptional()
    @IsUUID('4')
    id?: string;

    @ApiPropertyOptional()
    @IsOptional()
    name?: string;

    @ApiPropertyOptional()
    @IsOptional()
    symbol?: string;

    @ApiPropertyOptional()
    @IsOptional()
    address?: string;

    @ApiPropertyOptional({ type: String })
    @IsOptional()
    // @IsUUID('4')
    chainId?: string;

    @ApiPropertyOptional({ enum: PROTOCOL })
    @IsOptional()
    @IsEnum(PROTOCOL)
    protocol?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEnum(STATUS)
    status?: number;

    @ApiPropertyOptional()
    @IsOptional()
    assetId?: string;

    @ApiPropertyOptional({ type: String, description: 'The protocol id supported' })
    @IsOptional()
    @IsUUID('4')
    protocolId?: string;
}

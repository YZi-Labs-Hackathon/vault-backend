import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PROTOCOL, STATUS } from '@app/modules/shared/shared.constants';
import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateTokenDto {
    @ApiProperty()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsNotEmpty()
    symbol: string;

    @ApiProperty()
    @IsNotEmpty()
    address: string;

    @ApiProperty()
    @IsNotEmpty()
    logo: string;

    @ApiProperty({ type: Number })
    @IsNotEmpty()
    decimals: number;

    @ApiProperty({ type: String })
    @IsNotEmpty()
    @IsUUID('4')
    chainId: string;

    @ApiProperty({ enum: PROTOCOL })
    @IsNotEmpty()
    @IsEnum(PROTOCOL)
    protocol: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsEnum(STATUS)
    status?: number;

    @ApiPropertyOptional()
    @IsOptional()
    assetId?: string;
}

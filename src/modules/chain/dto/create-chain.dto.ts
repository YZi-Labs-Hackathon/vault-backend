import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ChainType } from '@app/common/types';
import { NetworkType, STATUS } from '@app/modules/shared/shared.constants';
import { Type } from 'class-transformer';
import { NativeCurrency, NetworkExplorer } from '@app/modules/chain/entities/chain.entity';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';

export class CreateChainDto {
    @ApiProperty()
    @IsNotEmpty()
    chainId: number;

    @ApiProperty({ enum: ChainType, default: ChainType.EVM })
    @IsNotEmpty()
    @IsEnum(ChainType)
    chainType: string;

    @ApiProperty()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional()
    @IsOptional()
    shortName?: string;

    @ApiPropertyOptional()
    @IsOptional()
    logo?: string;

    @ApiProperty({ type: [String] })
    @IsNotEmpty()
    rpc?: string[];

    @ApiProperty()
    @IsNotEmpty()
    tokenStandard: string;

    @ApiPropertyOptional()
    @IsOptional()
    durableBlockConfirmations?: number;

    @ApiProperty({ enum: NetworkType })
    @IsNotEmpty()
    @IsEnum(NetworkType)
    type: NetworkType;

    @ApiProperty()
    @IsNotEmpty()
    @Type(() => NativeCurrency)
    @ValidateNested()
    nativeCurrency: NativeCurrency;

    @ApiProperty({ type: [NetworkExplorer] })
    @IsNotEmpty()
    @Type(() => NetworkExplorer)
    @ValidateNested({ each: true })
    explorers: NetworkExplorer[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    defaultEnableNative?: boolean;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    skipDefaultGasForNative?: boolean;

    @ApiProperty()
    @IsNotEmpty()
    @IsEnum(STATUS)
    status?: number;

    @ApiPropertyOptional()
    @IsOptional()
    vaultFactoryAddress?: string;
}

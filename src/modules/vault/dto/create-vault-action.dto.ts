import { PROTOCOL_SERVICE } from '@app/modules/protocol/protocol.type';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

import { IsNotEmpty } from 'class-validator';

export class CreateVaultActionDto {
    @ApiProperty({ description: 'Service name', enum: PROTOCOL_SERVICE })
    @IsNotEmpty()
    @IsEnum(PROTOCOL_SERVICE)
    service: string;

    @ApiProperty({ description: 'Target address' })
    @IsNotEmpty()
    @IsString()
    to: string;

    @ApiProperty({ description: 'Data raw' })
    @IsNotEmpty()
    @IsString()
    dataRaw: string;

    @ApiProperty({ description: 'Vault address' })
    @IsNotEmpty()
    @IsString()
    vaultAddress: string;

    executeId?: string;
}

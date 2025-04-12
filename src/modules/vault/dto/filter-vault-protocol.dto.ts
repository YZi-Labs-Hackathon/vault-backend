import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class FilterVaultProtocolDto {
    @ApiProperty()
    @IsOptional()
    vaultId: string;


    @ApiProperty()
    @IsOptional()
    address: string;
}
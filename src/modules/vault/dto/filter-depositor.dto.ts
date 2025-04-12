import { ApiProperty } from '@nestjs/swagger';
import { Column } from 'typeorm';

export class FilterDepositorDto {
    @ApiProperty({ type: String, description: 'The Vault id' })
    vaultId: string;

    @ApiProperty({ type: String, description: 'The User id' })
    userId: string;
}
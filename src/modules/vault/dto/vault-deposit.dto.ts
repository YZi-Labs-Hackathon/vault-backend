import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class VaultDepositDto {
    @ApiProperty({ type: String, description: 'The vault id' })
    @IsNotEmpty()
    @IsUUID('4')
    vaultId: string;

    @ApiProperty({ type: String, example: 1000000, description: 'The amount of the deposit' })
    @IsNotEmpty()
    amount: string;
}

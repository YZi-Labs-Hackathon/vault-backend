import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SyncVaultDepositDto {
    @ApiProperty({ type: String, example: '0x', description: 'The txHash of the deposit' })
    @IsNotEmpty()
    txHash: string;

    @ApiProperty({ type: String, example: '0x', description: 'The vaultId of the deposit' })
    @IsNotEmpty()
    vaultId: string;
}

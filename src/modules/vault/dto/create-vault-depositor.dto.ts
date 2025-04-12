import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateVaultDepositorDto {
    @ApiProperty({ type: String, description: 'The Vault id' })
    @IsNotEmpty()
    @IsUUID('4')
    vaultId: string;

    @ApiProperty({ type: String, description: 'The User id' })
    @IsNotEmpty()
    @IsUUID('4')
    userId: string;

    @ApiProperty({ type: String, description: 'The share of the user' })
    @IsNotEmpty()
    share: string;

    @ApiProperty({ type: String, description: 'The amount deposit of the user' })
    @IsNotEmpty()
    amount: string;

    @ApiProperty({ type: String, description: 'The amount deposit of the user' })
    @IsNotEmpty()
    principalAmount: string;

    @ApiPropertyOptional({ type: String, description: 'The locked share' })
    @IsOptional()
    lockedAmount?: string;

    @ApiPropertyOptional({ type: Boolean, description: 'Time lock withdraw' })
    @IsOptional()
    lockedWithdrawAt?: number;
}

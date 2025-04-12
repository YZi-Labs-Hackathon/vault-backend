import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VAULT_TRANSACTION_STATUS, VAULT_TRANSACTION_TYPE } from '@app/modules/vault/vault.constants';
import { VaultFees, VaultTransactionMetadata } from '@app/modules/vault/entities/vault-transaction.entity';
import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateVaultTransactionDto {
    @ApiPropertyOptional({ type: String, description: 'txId' })
    @IsOptional()
    txId?: string;

    @ApiProperty({ type: String, description: 'The user id' })
    @IsNotEmpty()
    @IsUUID('4')
    userId: string;

    @ApiProperty({ type: String, description: 'The Vault id' })
    @IsNotEmpty()
    @IsUUID('4')
    vaultId: string;

    @ApiProperty({ type: String, description: 'The types of the flow', enum: VAULT_TRANSACTION_TYPE })
    @IsNotEmpty()
    @IsEnum(VAULT_TRANSACTION_TYPE)
    type: string;

    @ApiPropertyOptional({ type: String, description: 'The amount of the deposit' })
    @IsNotEmpty()
    amount: string;

    @ApiPropertyOptional({ type: String, description: 'The net amount' })
    @IsOptional()
    netAmount?: string;

    @ApiPropertyOptional({ type: String, description: 'The deadline of the transaction' })
    @IsOptional()
    deadline?: number;

    @ApiPropertyOptional({ type: String, description: 'The share calculated for the user' })
    @IsOptional()
    share?: string;

    @ApiPropertyOptional({ type: String, description: 'The hash of the transaction' })
    @IsOptional()
    txHash?: string;

    @ApiProperty({ type: String, description: 'The status of the flow', enum: VAULT_TRANSACTION_STATUS })
    @IsNotEmpty()
    @IsEnum(VAULT_TRANSACTION_STATUS)
    status: string;

    @ApiPropertyOptional({ type: VaultTransactionMetadata, description: 'The metadata of the vault transaction' })
    @IsOptional()
    metadata?: VaultTransactionMetadata;

    @ApiPropertyOptional({ type: VaultFees, description: 'The fees of the vault transaction', isArray: true })
    @IsOptional()
    fees?: VaultFees[];
}

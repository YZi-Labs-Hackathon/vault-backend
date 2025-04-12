import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VAULT_TRANSACTION_STATUS, VAULT_TRANSACTION_TYPE } from '@app/modules/vault/vault.constants';

export class FilterTransactionDto {

    @ApiProperty({ type: String, description: 'txId' })
    txId: string;

    @ApiProperty({ type: String, description: 'The user id' })
    userId: string;

    @ApiProperty({ type: String, description: 'The Vault id' })
    vaultId: string;

    @ApiProperty({ type: String, description: 'The types of the flow', enum: VAULT_TRANSACTION_TYPE })
    type: string;

    @ApiPropertyOptional({ type: String, description: 'The amount of the deposit' })
    amount?: number;

    @ApiPropertyOptional({ type: String, description: 'The share calculated for the user' })
    share?: number;

    @ApiPropertyOptional({ type: String, description: 'The hash of the transaction' })
    txHash?: string;

    @ApiProperty({ type: String, description: 'The status of the flow', enum: VAULT_TRANSACTION_STATUS })
    status: string;
}
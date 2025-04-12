import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VAULT_TRANSACTION_STATUS, VAULT_TRANSACTION_TYPE } from '../vault.constants';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class FilterVaultTransactionDto {
    @ApiPropertyOptional({ type: String, description: 'The vault id' })
    @IsOptional({})
    @IsUUID('4')
    id?: string;

    @ApiPropertyOptional({
        description: 'types transaction',
        example: VAULT_TRANSACTION_TYPE.DEPOSIT,
        enum: VAULT_TRANSACTION_TYPE,
    })
    @IsOptional()
    @IsEnum(VAULT_TRANSACTION_TYPE)
    type?: string;

    @ApiPropertyOptional({
        description: 'status transaction',
        example: VAULT_TRANSACTION_STATUS.CONFIRMED,
        enum: VAULT_TRANSACTION_STATUS,
    })
    @IsOptional()
    @IsEnum(VAULT_TRANSACTION_STATUS)
    status?: string;

    @ApiPropertyOptional({ type: String, description: 'The creator id' })
    @IsOptional({})
    @IsUUID('4')
    creatorId?: string;

    @ApiPropertyOptional({ type: String, description: 'The vault id' })
    @IsOptional({})
    @IsUUID('4')
    vaultId?: string;

    @ApiPropertyOptional({ type: String, description: 'The user id' })
    @IsOptional({})
    @IsUUID('4')
    userId?: string;

    @ApiPropertyOptional({ description: 'txId of transaction', example: '0x1234567890' })
    @IsOptional()
    txId?: string;

    @ApiPropertyOptional({ description: 'time start select transaction', example: 1740381608 })
    @IsOptional()
    timeStart?: number;

    @ApiPropertyOptional({ description: 'time end select transaction', example: 1740381608 })
    @IsOptional()
    endTime?: number;

    @ApiProperty({ description: 'status filter transaction', example: 'CONFIRMED,COMPLETED,FAILED' })
    @IsOptional()
    statusFilter?: string;

    @ApiProperty({ description: 'search transaction', example: 'partner' })
    @IsOptional()
    search?: string;
}

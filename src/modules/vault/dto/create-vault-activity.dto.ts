import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VAULT_ACTIVITY_STATUS, VAULT_ACTIVITY_TYPE } from '@app/modules/vault/vault.constants';
import { VaultActivityMetadata } from '@app/modules/vault/entities/vault-activity.entity';
import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { PROTOCOL_SERVICE } from '@app/modules/protocol/protocol.type';

export class CreateVaultActivityDto {
    @ApiProperty({ type: String, description: 'The Vault id' })
    @IsNotEmpty()
    @IsUUID('4')
    vaultId: string;

    @ApiProperty({ type: String, description: 'The type of the vault activity', enum: VAULT_ACTIVITY_TYPE })
    @IsNotEmpty()
    @IsEnum(VAULT_ACTIVITY_TYPE)
    type: string;

    @ApiProperty({ type: String, description: 'The protocol of the vault activity', enum: PROTOCOL_SERVICE })
    @IsNotEmpty()
    @IsEnum(PROTOCOL_SERVICE)
    protocol: string;

    @ApiProperty({ type: String, description: 'The transaction hash of activity' })
    @IsNotEmpty()
    txHash: string;

    @ApiPropertyOptional({ type: VaultActivityMetadata, description: 'The metadata of the vault activity' })
    @IsOptional()
    @Type(() => VaultActivityMetadata)
    metadata?: VaultActivityMetadata;

    @ApiProperty({
        type: String,
        description: 'The status of the activity',
        enum: VAULT_ACTIVITY_STATUS,
        default: VAULT_ACTIVITY_STATUS.PENDING,
    })
    @IsNotEmpty()
    @IsEnum(VAULT_ACTIVITY_STATUS)
    status: string;
}

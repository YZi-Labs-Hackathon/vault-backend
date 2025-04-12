import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { VAULT_ACTIVITY_STATUS, VAULT_ACTIVITY_TYPE } from '@app/modules/vault/vault.constants';
import { PROTOCOL_SERVICE } from '@app/modules/protocol/protocol.type';

export class FilterVaultActivityDto {
    @ApiPropertyOptional({ type: String, description: 'The activity id' })
    @IsOptional()
    @IsUUID('4')
    id?: string;

    @ApiPropertyOptional({ type: String, description: 'The Vault id' })
    @IsOptional()
    @IsUUID('4')
    creatorId?: string;

    @ApiPropertyOptional({ type: String, description: 'The Vault id' })
    @IsOptional()
    @IsUUID('4')
    vaultId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    txHash?: string;

    @ApiPropertyOptional({ type: String, description: 'The type of the vault activity', enum: VAULT_ACTIVITY_TYPE })
    @IsOptional()
    @IsEnum(VAULT_ACTIVITY_TYPE)
    type?: string;

    @ApiPropertyOptional({ type: String, description: 'The protocol of the vault activity', enum: PROTOCOL_SERVICE })
    @IsOptional()
    @IsEnum(PROTOCOL_SERVICE)
    protocol?: string;

    @ApiPropertyOptional({
        type: String,
        description: 'The status of the activity',
        enum: VAULT_ACTIVITY_STATUS,
    })
    @IsOptional()
    @IsEnum(VAULT_ACTIVITY_STATUS)
    status?: string;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { VAULT_ACTION_STATUS } from '@app/modules/vault/vault.constants';

export class FilterVaultActionDto {
    @ApiPropertyOptional({ type: String, description: 'The Vault action id' })
    @IsOptional()
    @IsUUID('4')
    id?: string;

    @ApiPropertyOptional({ type: String, description: 'The Vault id' })
    @IsOptional()
    @IsUUID('4')
    vaultId?: string;

    @ApiPropertyOptional({ type: String, description: 'The protocols action Id' })
    @IsOptional()
    @IsUUID('4')
    protocolActionId?: string;

    @ApiPropertyOptional({
        type: String,
        description: 'The status of the vault action',
        enum: VAULT_ACTION_STATUS,
    })
    @IsOptional()
    @IsEnum(VAULT_ACTION_STATUS)
    status?: string;
}

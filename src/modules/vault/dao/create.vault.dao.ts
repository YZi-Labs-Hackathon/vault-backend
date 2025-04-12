import { ApiProperty } from '@nestjs/swagger';
import { VAULT_STATUS } from '@app/modules/vault/vault.constants';

export class CreateVaultDao {
    @ApiProperty({ description: 'status create vault', type: String })
    status: boolean;

    @ApiProperty({ description: 'state create vault', enum: VAULT_STATUS })
    stateCreate: VAULT_STATUS;

    @ApiProperty({ description: 'message create vault', type: String })
    messageCreate: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { Action } from '@app/modules/protocol/entities/action.entity';
import { Vault } from '@app/modules/vault/dto';
import { VaultActivity } from '@app/modules/vault/entities/vault-activity.entity';

export class HistoryActivity extends VaultActivity{
    @ApiProperty()
    actionInfo: Action;

    @ApiProperty()
    vaultInfo: Vault;
}
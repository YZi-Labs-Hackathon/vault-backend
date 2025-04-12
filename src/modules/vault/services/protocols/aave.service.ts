import { Injectable } from '@nestjs/common';
import { BaseActionService } from '@app/modules/vault/services/protocols/base-action.service';
import { PROTOCOL_SERVICE } from '@app/modules/protocol/protocol.type';
import { Vault } from '@app/modules/vault/entities/vault.entity';
import { VaultAction } from '@app/modules/vault/entities/vault-action.entity';

@Injectable()
export class AaveService extends BaseActionService {
    getIdentifier() {
        return PROTOCOL_SERVICE.AAVE;
    }
}

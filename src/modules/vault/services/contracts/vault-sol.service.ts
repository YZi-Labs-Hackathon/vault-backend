import { Injectable } from '@nestjs/common';
import { VaultBaseService } from '@app/modules/vault/services/contracts/vault-base.service';
import { VAULT_CHAIN_TYPE } from '@app/modules/vault/vault.constants';

@Injectable()
export class VaultSolService extends VaultBaseService {
    getIdentifier(): VAULT_CHAIN_TYPE {
        return VAULT_CHAIN_TYPE.SOL;
    }
}

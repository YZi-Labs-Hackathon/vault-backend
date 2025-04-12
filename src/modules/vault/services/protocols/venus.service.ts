import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { BaseActionService } from '@app/modules/vault/services/protocols/base-action.service';
import { PROTOCOL_SERVICE } from '@app/modules/protocol/protocol.type';
import { Vault } from '@app/modules/vault/entities/vault.entity';
import { VaultAction } from '@app/modules/vault/entities/vault-action.entity';
import { Contract, ethers } from 'ethers';
import { ChainService } from '@app/modules/chain/services/chain.service';
import { ChainType } from '@app/common/types';
import { TokenService } from '@app/modules/token/services/token.service';
import { Chain } from '@app/modules/chain/entities/chain.entity';
import { VaultContractService } from '@app/modules/vault/services/contracts/vault-contract.service';
import { ActionInterface } from './action.interface';

@Injectable()
export class VenusService extends BaseActionService {
    getIdentifier() {
        return PROTOCOL_SERVICE.VENUS;
    }
}

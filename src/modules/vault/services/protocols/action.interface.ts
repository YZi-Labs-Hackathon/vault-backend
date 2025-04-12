import { PROTOCOL_SERVICE } from '@app/modules/protocol/protocol.type';
import { Vault } from '@app/modules/vault/entities/vault.entity';
import { VaultAction } from '@app/modules/vault/entities/vault-action.entity';
import { Chain } from '@app/modules/chain/entities/chain.entity';

export interface ActionInterface {
    getIdentifier(): PROTOCOL_SERVICE;

    getUserAssets(vault: Vault, userAddress: string, chain: Chain): Promise<string>;

    getVaultValue(vault: Vault, chain: Chain): Promise<string>;

    getShareRate(vault: Vault, chain: Chain): Promise<string>;

    getTotalSupply(vault: Vault, chain: Chain): Promise<string>;

    getUserShare(vault: Vault, userAddress: string, chain: Chain): Promise<string>;

    getTotalSupply(vault: Vault, chain: Chain): Promise<string>;
}

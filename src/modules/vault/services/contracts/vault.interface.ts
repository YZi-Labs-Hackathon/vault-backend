import { VAULT_CHAIN_TYPE } from '@app/modules/vault/vault.constants';

export interface VaultInterface {
    getIdentifier(): VAULT_CHAIN_TYPE;

    getUserShare(vautlAddress: string, address: string, chainId: number, rpc: string): Promise<string>;

    getTotalSupply(vautlAddress: string, chainId: number, rpc: string): Promise<string>;

    getShareRate(vautlAddress: string, chainId: number, rpc: string): Promise<string>;

    getVaultValue(vautlAddress: string, chainId: number, rpc: string): Promise<string>;

    userAssets(vaultAddress: string, address: string, chainId: number, rpc: string): Promise<string>;
}

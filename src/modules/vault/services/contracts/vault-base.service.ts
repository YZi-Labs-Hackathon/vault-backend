import { VaultInterface } from '@app/modules/vault/services/contracts/vault.interface';
import { Injectable } from '@nestjs/common';

class VAULT_CHAIN_TYPE {}

@Injectable()
export class VaultBaseService implements VaultInterface {
    userAssets(vaultAddress: string, address: string, chainId: number, rpc: string): Promise<string> {
        throw new Error('Method not implemented.');
    }

    getIdentifier() {
        return null;
    }

    getShareRate(vautlAddress: string, chainId: number, rpc: string): Promise<string> {
        throw new Error('Method not implemented.');
    }

    getUserShare(vautlAddress: string, address: string, chainId: number, rpc: string): Promise<string> {
        throw new Error('Method not implemented.');
    }

    getTotalSupply(vautlAddress: string, chainId: number, rpc: string): Promise<string> {
        throw new Error('Method not implemented.');
    }

    getVaultValue(vautlAddress: string, chainId: number, rpc: string): Promise<string> {
        return Promise.resolve('0');
    }
}

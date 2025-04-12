import { ActionInterface } from '@app/modules/vault/services/protocols/action.interface';
import { Vault } from '@app/modules/vault/entities/vault.entity';
import { Chain } from '@app/modules/chain/entities/chain.entity';
import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { VAULT_CHAIN_TYPE } from '../../vault.constants';
import { VaultContractService } from '../contracts/vault-contract.service';

@Injectable()
export class BaseActionService implements ActionInterface {
    getUserShare(vault: Vault, userAddress: string, chain: Chain): Promise<string> {
        throw new Error('Method not implemented.');
    }
    @Inject(forwardRef(() => VaultContractService))
    protected vaultContractService: VaultContractService;

    getIdentifier() {
        return null;
    }

    getVaultService(vaultType: VAULT_CHAIN_TYPE) {
        return this.vaultContractService.getVaultService(vaultType);
    }

    async getUserAssets(vault: Vault, userAddress: string, chain: Chain): Promise<string> {
        console.log(`getUserAssets`, vault.contractAddress, userAddress, chain);
        return this.vaultContractService.userAssets(vault.contractAddress, userAddress, chain);
    }

    async getVaultValue(vault: Vault, chain: Chain): Promise<string> {
        return await this.vaultContractService.getVaultValue(vault.contractAddress);
    }

    async getShareRate(vault: Vault, chain: Chain): Promise<string> {
        return await this.vaultContractService.getShareRate(vault.contractAddress, chain);
    }

    async getTotalSupply(vault: Vault, chain: Chain): Promise<string> {
        return await this.vaultContractService.getTotalSupply(vault.contractAddress, chain);
    }
}

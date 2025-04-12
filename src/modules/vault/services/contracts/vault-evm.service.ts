import { Injectable, Logger } from '@nestjs/common';
import { VaultBaseService } from '@app/modules/vault/services/contracts/vault-base.service';
import { VAULT_CHAIN_TYPE } from '@app/modules/vault/vault.constants';
import { ethers } from 'ethers';
import { ERC20__factory, EVMVault__factory } from '@app/types/vault';

@Injectable()
export class VaultEvmService extends VaultBaseService {
    getIdentifier(): VAULT_CHAIN_TYPE {
        return VAULT_CHAIN_TYPE.EVM;
    }

    async getUserShare(vautlAddress: string, address: string, chainId: number, rpc: string): Promise<string> {
        try {
            const provider = new ethers.JsonRpcProvider(rpc, {
                name: 'unknown',
                chainId,
            });
            const vaultErc = ERC20__factory.connect(vautlAddress, provider);
            const share = await vaultErc.balanceOf(address);
            console.log(`share`, share.toString());
            return share.toString();
        } catch (error) {
            Logger.error(error);
            return '0';
        }
    }

    async getTotalSupply(vautlAddress: string, chainId: number, rpc: string): Promise<string> {
        const provider = new ethers.JsonRpcProvider(rpc, {
            name: 'unknown',
            chainId,
        });
        const vaultErc = ERC20__factory.connect(vautlAddress, provider);
        const supply = await vaultErc.totalSupply();
        return supply.toString();
    }

    // async getShareRate(vautlAddress: string, chainId: number, rpc: string): Promise<string> {
    //     // const provider = new ethers.JsonRpcProvider(rpc, {
    //     //     name: 'unknown',
    //     //     chainId,
    //     // });
    //     // const vaultFactory = EVMVault__factory.connect(vautlAddress, provider);
    //     // const shareRate = await vaultFactory.shareRate();
    //     // return shareRate.toString();
    //     // const vaultVaue = await super.getVaultValue(vautlAddress);

    //     return '0';
    // }

    // async getTotalAssets(vautlAddress: string, chainId: number, rpc: string): Promise<string> {
    //     const provider = new ethers.JsonRpcProvider(rpc, {
    //         name: 'unknown',
    //         chainId,
    //     });
    //     const vaultFactory = EVMVault__factory.connect(vautlAddress, provider);
    //     const totalAssets = await vaultFactory.getVaultValue();
    //     return totalAssets.toString();
    // }

    // async userAssets(vaultAddress: string, address: string, chainId: number, rpc: string): Promise<string> {
    //     const provider = new ethers.JsonRpcProvider(rpc, {
    //         name: 'unknown',
    //         chainId,
    //     });
    //     const vaultFactory = EVMVault__factory.connect(vaultAddress, provider);
    //     const userShare = await vaultFactory.balanceOf(address);
    //     // TODO: Calc share rate currently
    //     const shareRate = await vaultFactory.shareRate();
    //     const userAsset = ((BigInt(userShare) * BigInt(shareRate)) / BigInt(1e18)).toString();
    //     return userAsset;
    //     // const userAssets = await vaultFactory.userAssets(address);
    // }
}

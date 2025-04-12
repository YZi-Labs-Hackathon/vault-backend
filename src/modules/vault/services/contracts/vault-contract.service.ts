import { forwardRef, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { VaultEvmService } from '@app/modules/vault/services/contracts/vault-evm.service';
import { VaultSolService } from '@app/modules/vault/services/contracts/vault-sol.service';
import { VaultBaseService } from '@app/modules/vault/services/contracts/vault-base.service';
import { Chain } from '@app/modules/chain/entities/chain.entity';
import { VaultValidatorService } from '@app/modules/shared/services/vault-validator.service';
import { CustomException } from '@app/common/errors';
import { Logger } from '@nestjs/common';
@Injectable()
export class VaultContractService implements OnModuleInit {
    protected vaults: VaultBaseService[] = [];
    @Inject(forwardRef(() => VaultEvmService)) private readonly vaultEvmService: VaultEvmService;
    @Inject(forwardRef(() => VaultSolService)) private readonly vaultSolService: VaultSolService;
    @Inject() private readonly vaultValidatorService: VaultValidatorService;
    constructor() {}

    onModuleInit() {
        const map = new Map<string, VaultBaseService>();
        map.set('vaultEvmService', this.vaultEvmService);
        map.set('vaultSolService', this.vaultSolService);
        this.vaults.push(...map.values());
    }

    getVaultService(vaultType: string): VaultBaseService {
        return this.vaults.find((action) => action.getIdentifier() === vaultType);
    }

    async getUserShare(vautlAddress: string, address: string, chain: Chain): Promise<string> {
        try {
            const rpc = chain.rpc[Math.floor(Math.random() * chain.rpc.length)];
            const vaultService = this.getVaultService(chain.chainType);
            return await vaultService.getUserShare(vautlAddress, address, chain.chainId, rpc);
        } catch (error) {
            Logger.error(`Get total share error`, error);
            throw new CustomException('Get total share error', 500);
        }
    }

    async getTotalSupply(vautlAddress: string, chain: Chain): Promise<string> {
        const rpc = chain.rpc[Math.floor(Math.random() * chain.rpc.length)];
        const vaultService = this.getVaultService(chain.chainType);
        return await vaultService.getTotalSupply(vautlAddress, chain.chainId, rpc);
    }

    async getShareRate(vautlAddress: string, chain: Chain): Promise<string> {
        const rpc = chain.rpc[Math.floor(Math.random() * chain.rpc.length)];
        const vaultService = this.getVaultService(chain.chainType);
        const [vautlValue, totalSupply] = await Promise.all([
            this.getVaultValue(vautlAddress),
            vaultService.getTotalSupply(vautlAddress, chain.chainId, rpc),
        ]);
        if (totalSupply === '0') {
            return '0';
        }
        return (Number(vautlValue) / Number(totalSupply)).toString();
    }

    async getVaultValue(vautlAddress: string) {
        try {
            if (!vautlAddress) {
                return '0';
            }
            return await this.vaultValidatorService.getVaultValue(vautlAddress);
        } catch (error) {
            Logger.error(`Get vautl tvl error`, error);
            throw new CustomException('Get vautl tvl error', 500);
        }
    }

    async userAssets(vaultAddress: string, userAddress: string, chain: Chain): Promise<string> {
        try {
            if (!vaultAddress) {
                return '0';
            }
            const rpc = chain.rpc[Math.floor(Math.random() * chain.rpc.length)];
            const vaultService = this.getVaultService(chain.chainType);
            const [vautlValue, totalSupply, userShare] = await Promise.all([
                this.getVaultValue(vaultAddress),
                vaultService.getTotalSupply(vaultAddress, chain.chainId, rpc),
                vaultService.getUserShare(vaultAddress, userAddress, chain.chainId, rpc),
            ]);
            console.log(`vautlValue`, vautlValue);
            console.log(`totalSupply`, totalSupply);
            console.log(`userShare`, userShare);
            const userAssets = (BigInt(userShare) * BigInt(vautlValue)) / BigInt(totalSupply);
            return userAssets.toString();
        } catch (error) {
            Logger.error(`Get total asset error`, error);
            return '0';
        }
    }
}

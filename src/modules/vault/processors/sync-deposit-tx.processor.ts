import { OnQueueCompleted, OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { VAULT_PROCESSOR, VAULT_STATUS } from '@app/modules/vault/vault.constants';
import { VaultService } from '@app/modules/vault/services/vault.service';
import { ChainService } from '@app/modules/chain/services/chain.service';
import { TokenService } from '@app/modules/token/services/token.service';
import { ChainType } from '@app/common/types';
import { ethers } from 'ethers';
import { Token } from '@app/modules/token/entities/token.entity';
import { Chain } from '@app/modules/chain/entities/chain.entity';
import { Vault } from '@app/modules/vault/entities/vault.entity';
import { PROTOCOL_SERVICE } from '@app/modules/protocol/protocol.type';
import { VaultValidatorService } from '@app/modules/shared/services/vault-validator.service';
import { EVMVault__factory } from '@app/types/vault';

@Processor(VAULT_PROCESSOR.SYNC_DEPOSIT)
export class SyncDepositTxProcessor {
    constructor(
        private readonly vaultService: VaultService,
        private readonly chainService: ChainService,
        private readonly tokenService: TokenService,
        private readonly vaultValidatorService: VaultValidatorService
    ) {}

    @Process({
        concurrency: 100,
    })
    async process(job: Job) {
        const data: { txHash: string; vaultId: string } = job.data;
        const vault = await this.vaultService.findById(data.vaultId);
        if (!vault || (vault && vault.status !== VAULT_STATUS.ACTIVE)) {
            return;
        }
        const [chain, token] = await Promise.all([
            this.chainService.detail(vault.chainId),
            this.tokenService.detail(vault.tokenId),
        ]);
        if (chain.chainType === ChainType.EVM) {
            await this.syncEVMDeposit(vault, chain, token, data.txHash);
        }
        return true;
    }

    @OnQueueCompleted()
    async onCompleted(job: Job) {
        console.info(`SYNC_DEPOSIT OnQueueCompleted`);
    }

    @OnQueueFailed()
    async onFailed(job: Job, err: any) {
        console.error(`SYNC_DEPOSIT OnQueueFailed`, err);
    }

    private async syncEVMDeposit(vault: Vault, chain: Chain, token: Token, txHash: string) {
        const rpc = chain.rpc[Math.floor(Math.random() * chain.rpc.length)];
        const provider = new ethers.JsonRpcProvider(rpc, {
            name: 'unknown',
            chainId: chain.chainId,
        });
        const tx = await provider.getTransactionReceipt(txHash);
        if (tx) {
            if (tx.to == vault.contractAddress) {
                const logs = tx.logs;
                const vaultFactory = EVMVault__factory.connect(vault.contractAddress, provider);
                const topic = '0xdcbc1c05240f31ff3ad067ef1ee35ce4997762752e3a095284754544f4c709d7';
                const depositEvent = logs.find((log) => log.topics[0] === topic);
                if (depositEvent) {
                    const depositData = vaultFactory.interface.parseLog(depositEvent);
                    const owner = depositData.args['owner'] ?? depositData.args['token'];
                    const assets = depositData.args['assets'] ?? depositData.args['reserve'];
                    const shares = depositData.args['shares'] ?? depositData.args['sysbalance'];

                    if (owner && assets && shares) {
                    }
                }
            }
        }

        return true;
    }
}

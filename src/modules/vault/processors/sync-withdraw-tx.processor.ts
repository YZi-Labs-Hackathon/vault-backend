import { OnQueueCompleted, OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { VAULT_PROCESSOR, VAULT_STATUS } from '@app/modules/vault/vault.constants';
import { ChainType } from '@app/common/types';
import { VaultService } from '@app/modules/vault/services/vault.service';
import { ChainService } from '@app/modules/chain/services/chain.service';
import { TokenService } from '@app/modules/token/services/token.service';
import { Vault } from '@app/modules/vault/entities/vault.entity';
import { Chain } from '@app/modules/chain/entities/chain.entity';
import { Token } from '@app/modules/token/entities/token.entity';
import { ethers } from 'ethers';
import { PROTOCOL_SERVICE } from '@app/modules/protocol/protocol.type';
import { VaultValidatorService } from '@app/modules/shared/services/vault-validator.service';
import { EVMVault__factory } from '@app/types/vault';

@Processor(VAULT_PROCESSOR.SYNC_WITHDRAW)
export class SyncWithdrawTxProcessor {
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
            await this.syncEVMWithdraw(vault, chain, token, data.txHash);
        }
        return true;
    }

    @OnQueueCompleted()
    async onCompleted(job: Job) {
        console.info(`SYNC_WITHDRAW OnQueueCompleted`);
    }

    @OnQueueFailed()
    async onFailed(job: Job, err: any) {
        console.error(`SYNC_WITHDRAW OnQueueFailed`, err);
    }

    private async syncEVMWithdraw(vault: Vault, chain: Chain, token: Token, txHash: string) {
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
                const topic = '0xf5282d32a8fc41145df29a080097325f32326a749173b3f886619a6d08c026a3';
                const withdrawEvent = logs.find((log) => log.topics[0] === topic);
                if (withdrawEvent) {
                    const withdrawData = vaultFactory.interface.parseLog(withdrawEvent);
                    console.log(`withdraw event`, withdrawData);
                    const withdrawId = withdrawData.args.withdrawId;
                    if (withdrawId) {
                        const flag = await this.vaultService.updateWithdrawTxId(vault, withdrawId, txHash);
                        if (flag && vault.protocol) {
                            if (vault.protocol.service == PROTOCOL_SERVICE.APEX) {
                                try {
                                    await this.vaultValidatorService.syncAssetsApex(vault.contractAddress);
                                } catch (e) {
                                    console.error(`[SyncDepositTxProcessor] syncEVMDeposit error`, e);
                                }
                            }
                        }
                    }
                }
            }
        }

        return true;
    }
}

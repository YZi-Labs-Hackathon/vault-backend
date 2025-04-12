import { InjectQueue, OnQueueCompleted, OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { VaultService } from '@app/modules/vault/services/vault.service';
import { ethers, formatUnits } from 'ethers';
import { Chain } from '@app/modules/chain/entities/chain.entity';
import { WEBHOOK_QUEUE } from '@app/modules/webhook/webhook.constants';
import { ChainService } from '@app/modules/chain/services/chain.service';
import { VAULT_STATUS } from '@app/modules/vault/vault.constants';
import { ChainType } from '@app/common/types';
import { Vault } from '@app/modules/vault/entities/vault.entity';
import { PROTOCOL_SERVICE } from '@app/modules/protocol/protocol.type';
import { VaultValidatorService } from '@app/modules/shared/services/vault-validator.service';
import { EVMVault__factory } from '@app/types/vault';

@Processor(WEBHOOK_QUEUE.WEBHOOK_DEPOSIT)
export class SyncDepositTxProcessor {
    constructor(
        private readonly vaultService: VaultService,
        private readonly chainService: ChainService,
        private readonly vaultValidatorService: VaultValidatorService,
        @InjectQueue(WEBHOOK_QUEUE.WEBHOOK_TRANSFER_FUND_APEX)
        private readonly webhookFund: Queue<{ vaultAddress: string; amount: string }>
    ) {}

    @Process({
        concurrency: 100,
    })
    async process(job: Job) {
        const data: { txHash: string; vault: string } = job.data;
        const vault = await this.vaultService.findOne({
            relations: ['protocol', 'token'],
            where: {
                contractAddress: data.vault,
            },
        });
        if (!vault || (vault && vault.status !== VAULT_STATUS.ACTIVE)) {
            return;
        }
        const [chain] = await Promise.all([this.chainService.detail(vault.chainId)]);
        if (chain.chainType === ChainType.EVM) {
            await this.syncEVMDeposit(vault, chain, data.txHash);
        }
        return true;
    }

    @OnQueueCompleted()
    async onCompleted(job: Job) {
        console.info(`WEBHOOK_DEPOSIT OnQueueCompleted`);
    }

    @OnQueueFailed()
    async onFailed(job: Job, err: any) {
        console.error(`WEBHOOK_DEPOSIT OnQueueFailed`, err);
    }

    private async syncEVMDeposit(vault: Vault, chain: Chain, txHash: string) {
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
                const topic = '0x79244216796182f1734f583167a6a9a15a3ef1ce5db6ec35ee25a0dbcc7ca045';
                const depositEvent = logs.find((log) => log.topics[0] === topic);
                console.log(`depositEvent`, depositEvent);
                if (depositEvent) {
                    const depositData = vaultFactory.interface.parseLog(depositEvent);
                    const depositId = depositData.args[0];
                    const owner = depositData.args[1];
                    const assets = depositData.args[2];

                    if (owner && assets) {
                        const flag = await this.vaultService.updateDepositTxId(
                            vault,
                            depositId,
                            owner,
                            assets.toString(),
                            txHash
                        );
                        if (flag && vault.protocol) {
                            if (vault.protocol.service == PROTOCOL_SERVICE.APEX) {
                                try {
                                    await this.vaultValidatorService.syncAssetsApex(vault.contractAddress);
                                    let amount = formatUnits(assets, +vault.token.decimals);
                                    await this.webhookFund.add({ vaultAddress: vault.contractAddress, amount });
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

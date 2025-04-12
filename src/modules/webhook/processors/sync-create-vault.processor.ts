import { InjectQueue, OnQueueCompleted, OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Job, Queue } from 'bull';
import { VaultService } from '@app/modules/vault/services/vault.service';
import { ethers } from 'ethers';
import { Chain } from '@app/modules/chain/entities/chain.entity';
import { WEBHOOK_QUEUE } from '@app/modules/webhook/webhook.constants';
import { ChainService } from '@app/modules/chain/services/chain.service';
import { EVMVault__factory, EVMVaultFactory__factory } from '@app/types/vault';

@Processor(WEBHOOK_QUEUE.WEBHOOK_CREATE_VAULT)
export class SyncCreateVaultProcessor {
    private readonly VAULT_FACTORY_EVM_ADDRESS = process.env.VAULT_FACTORY_EVM_ADDRESS || '';

    constructor(
        private readonly vaultService: VaultService,
        private readonly chainService: ChainService,
        @InjectQueue(WEBHOOK_QUEUE.VALIDATOR_WEBHOOK_UPDATE_VAULT)
        private readonly validatorWebhookUpdateVaultQueue: Queue<{
            vaultAddress: string;
            vaultId: string;
            chainId: number;
        }>
    ) {}

    @Process({
        concurrency: 100,
    })
    async process(job: Job) {
        const data: { txHash: string; chainId: string } = job.data;
        const chain = await this.chainService.findOne({
            where: {
                chainId: +data.chainId,
            },
        });
        if (!chain) {
            return true;
        }

        const vault = await this.syncEVMCreateVault(chain, data.txHash);
        if (vault) {
            await this.validatorWebhookUpdateVaultQueue.add({
                vaultAddress: vault.contractAddress,
                vaultId: vault.id,
                chainId: chain.chainId,
            });
        }
    }

    @OnQueueCompleted()
    async onCompleted(job: Job) {
        console.info(`WEBHOOK_CREATE_VAULT OnQueueCompleted`);
    }

    @OnQueueFailed()
    async onFailed(job: Job, err: any) {
        console.error(`WEBHOOK_CREATE_VAULT OnQueueFailed`, err);
    }

    private async syncEVMCreateVault(chain: Chain, txHash: string) {
        const rpc = chain.rpc[Math.floor(Math.random() * chain.rpc.length)];
        const provider = new ethers.JsonRpcProvider(rpc, {
            name: 'unknown',
            chainId: chain.chainId,
        });
        const tx = await provider.getTransactionReceipt(txHash);
        if (tx) {
            if (tx.to == chain.vaultFactoryAddress) {
                const logs = tx.logs;
                const vaultFactory = EVMVaultFactory__factory.connect(chain.vaultFactoryAddress, provider);
                const topic = '0x0b045af6aff86dd2cda5342fd0329a354dc66759ff1eda00d7ecf13a76c7fb3b';
                const createVaultLog = logs.find((log) => log.topics[0] === topic);
                if (createVaultLog) {
                    const createVaultData = vaultFactory.interface.parseLog(createVaultLog);
                    console.log(`Vault data`, createVaultData);
                    const vault = createVaultData.args[0];
                    if (vault) {
                        const vaultF = EVMVault__factory.connect(createVaultData.args.vault, provider);
                        const [name, symbol] = await Promise.all([vaultF.name(), vaultF.symbol()]);
                        console.log(`Vault name: ${name}, symbol: ${symbol}`);
                        return await this.vaultService.updateVaultAddress(
                            createVaultData.args.vault,
                            tx.hash,
                            name,
                            symbol
                        );
                    }
                }
            }
        }

        return false;
    }
}

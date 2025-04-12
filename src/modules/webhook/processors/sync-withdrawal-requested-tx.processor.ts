import { OnQueueCompleted, OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { VaultService } from '@app/modules/vault/services/vault.service';
import { Vault } from '@app/modules/vault/entities/vault.entity';
import { Chain } from '@app/modules/chain/entities/chain.entity';
import { WEBHOOK_QUEUE } from '@app/modules/webhook/webhook.constants';
import { ChainService } from '@app/modules/chain/services/chain.service';
import { VaultValidatorService } from '@app/modules/shared/services/vault-validator.service';
import { VAULT_STATUS } from '@app/modules/vault/vault.constants';
import { ChainType } from '@app/common/types';
import { PROTOCOL_SERVICE } from '@app/modules/protocol/protocol.type';

@Processor(WEBHOOK_QUEUE.WEBHOOK_WITHDRAWAL_REQUESTED)
export class SyncWithdrawalRequestedTxProcessor {
    constructor(
        private readonly vaultService: VaultService,
        private readonly chainService: ChainService,
        private readonly vaultValidatorService: VaultValidatorService
    ) {}

    @Process({
        concurrency: 100,
    })
    async process(job: Job) {
        const data: { txHash: string; vault: string } = job.data;
        console.log(`[SyncWithdrawalRequestedTxProcessor] process`, data);
        const vault = await this.vaultService.findOne({
            relations: ['protocol'],
            where: {
                contractAddress: data.vault,
            },
        });
        if (!vault || (vault && vault.status !== VAULT_STATUS.ACTIVE)) {
            return;
        }
        const [chain] = await Promise.all([this.chainService.detail(vault.chainId)]);
        if (chain.chainType === ChainType.EVM) {
            await this.syncEVMWithdraw(vault, chain, data.txHash);
        }
        return true;
    }

    @OnQueueCompleted()
    async onCompleted(job: Job) {
        console.info(`WEBHOOK_WITHDRAWAL_REQUESTED OnQueueCompleted`);
    }

    @OnQueueFailed()
    async onFailed(job: Job, err: any) {
        console.error(`WEBHOOK_WITHDRAWAL_REQUESTED OnQueueFailed`, err);
    }

    private async syncEVMWithdraw(vault: Vault, chain: Chain, txHash: string) {
        if (vault.protocol.service == PROTOCOL_SERVICE.APEX) {
            try {
                await this.vaultValidatorService.syncAssetsApex(vault.contractAddress);
            } catch (e) {
                console.error(`[SyncWithdrawalRequestedTxProcessor] sync Oracle Apex error`, e);
            }
        }
    }
}

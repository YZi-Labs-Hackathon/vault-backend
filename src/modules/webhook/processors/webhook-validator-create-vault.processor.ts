import { OnQueueCompleted, OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { WEBHOOK_QUEUE } from '@app/modules/webhook/webhook.constants';
import { VaultValidatorService } from '@app/modules/shared/services/vault-validator.service';

@Processor(WEBHOOK_QUEUE.VALIDATOR_WEBHOOK_UPDATE_VAULT)
export class WebhookValidatorCreateVaultProcessor {
    constructor(private readonly validatorService: VaultValidatorService) {}

    @Process({
        concurrency: 100,
    })
    async process(job: Job) {
        const data: { vaultAddress: string; vaultId: string; chainId: number } = job.data;
        console.info('WebhookValidatorCreateVaultProcessor data', data);
        await this.validatorService.createVaultWebhook(data);
        return true;
    }

    @OnQueueCompleted()
    async onCompleted(job: Job) {
        console.info(`VALIDATOR_WEBHOOK_UPDATE_VAULT OnQueueCompleted`);
    }

    @OnQueueFailed()
    async onFailed(job: Job, err: any) {
        console.error(`VALIDATOR_WEBHOOK_UPDATE_VAULT OnQueueFailed`, err);
    }
}

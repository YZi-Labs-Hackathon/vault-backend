import { OnQueueCompleted, OnQueueFailed, Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { WEBHOOK_QUEUE } from '@app/modules/webhook/webhook.constants';
import { VaultValidatorService } from '@app/modules/shared/services/vault-validator.service';

@Processor(WEBHOOK_QUEUE.WEBHOOK_TRANSFER_FUND_APEX)
export class WebhookTransferFundApexProcessor {
    constructor(private readonly validatorService: VaultValidatorService) {}

    @Process({
        concurrency: 100,
    })
    async process(job: Job) {
        const data: { vaultAddress: string; amount: string } = job.data;
        console.info('WEBHOOK_TRANSFER_FUND_APEX data', data);
        await this.validatorService.webhookTransferFundPerp(data);
        return true;
    }

    @OnQueueCompleted()
    async onCompleted(job: Job) {
        console.info(`WEBHOOK_TRANSFER_FUND_APEX OnQueueCompleted`);
    }

    @OnQueueFailed()
    async onFailed(job: Job, err: any) {
        console.error(`WEBHOOK_TRANSFER_FUND_APEX OnQueueFailed`, err);
    }
}

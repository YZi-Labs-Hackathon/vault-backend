import { Injectable } from '@nestjs/common';
import { WebhookDepositDto } from '@app/modules/webhook/dto/webhook-deposit.dto';
import { WebhookWithdrawDto } from '@app/modules/webhook/dto/webhook-withdraw.dto';
import { WebhookCreateVaultDto } from '@app/modules/webhook/dto/webhook-create-vault.dto';
import { InjectQueue } from '@nestjs/bull';
import { WEBHOOK_QUEUE } from '@app/modules/webhook/webhook.constants';
import { Queue } from 'bull';

@Injectable()
export class WebhookService {
    constructor(
        @InjectQueue(WEBHOOK_QUEUE.WEBHOOK_CREATE_VAULT)
        private readonly createVaultQueue: Queue<{
            txHash: string;
            chainId: string;
        }>,
        @InjectQueue(WEBHOOK_QUEUE.WEBHOOK_DEPOSIT)
        private readonly depositQueue: Queue<{
            txHash: string;
            vault: string;
        }>,
        @InjectQueue(WEBHOOK_QUEUE.WEBHOOK_WITHDRAW)
        private readonly withdrawQueue: Queue<{
            txHash: string;
            vault: string;
        }>,
        @InjectQueue(WEBHOOK_QUEUE.WEBHOOK_WITHDRAWAL_REQUESTED)
        private readonly withdrawalRequestQueue: Queue<{
            txHash: string;
            vault: string;
        }>,
        @InjectQueue(WEBHOOK_QUEUE.WEBHOOK_WITHDRAWAL_CLAIMED)
        private readonly withdrawalClaimQueue: Queue<{
            txHash: string;
            vault: string;
        }>
    ) {}

    async deposit(params: WebhookDepositDto) {
        await this.depositQueue.add(params);
        return true;
    }

    async withdraw(params: WebhookWithdrawDto) {
        await this.withdrawQueue.add(params);
        return true;
    }

    async createVault(params: WebhookCreateVaultDto) {
        await this.createVaultQueue.add(params);
        return true;
    }

    async withdrawalRequested(params: WebhookWithdrawDto) {
        await this.withdrawalRequestQueue.add(params);
        return true;
    }

    async WithdrawalClaim(params: WebhookWithdrawDto) {
        await this.withdrawalClaimQueue.add(params);
        return true;
    }
}

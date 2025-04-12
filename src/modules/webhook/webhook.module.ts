import { Module } from '@nestjs/common';
import { WebhookService } from './services/webhook.service';
import { WebhookController } from './controllers/webhook.controller';
import { VaultModule } from '@app/modules/vault/vault.module';
import { BullModule } from '@nestjs/bull';
import { WEBHOOK_QUEUE } from '@app/modules/webhook/webhook.constants';
import { ChainModule } from '@app/modules/chain/chain.module';
import { SyncWithdrawTxProcessor } from '@app/modules/webhook/processors/sync-withdraw-tx.processor';
import { SyncDepositTxProcessor } from '@app/modules/webhook/processors/sync-deposit-tx.processor';
import { SyncCreateVaultProcessor } from '@app/modules/webhook/processors/sync-create-vault.processor';
import { UserModule } from '@app/modules/user/user.module';
import { WebhookValidatorCreateVaultProcessor } from '@app/modules/webhook/processors/webhook-validator-create-vault.processor';
import { SyncWithdrawalClaimTxProcessor } from '@app/modules/webhook/processors/sync-withdrawal-claim-tx.processor';
import { SyncWithdrawalRequestedTxProcessor } from '@app/modules/webhook/processors/sync-withdrawal-requested-tx.processor';
import { WebhookTransferFundApexProcessor } from '@app/modules/webhook/processors/webhook-transfer-fund-apex.processor';

@Module({
    imports: [
        BullModule.registerQueue(
            {
                name: WEBHOOK_QUEUE.WEBHOOK_DEPOSIT,
            },
            {
                name: WEBHOOK_QUEUE.WEBHOOK_WITHDRAW,
            },
            {
                name: WEBHOOK_QUEUE.WEBHOOK_CREATE_VAULT,
            },
            {
                name: WEBHOOK_QUEUE.VALIDATOR_WEBHOOK_UPDATE_VAULT,
            },
            {
                name: WEBHOOK_QUEUE.WEBHOOK_WITHDRAWAL_REQUESTED,
            },
            {
                name: WEBHOOK_QUEUE.WEBHOOK_WITHDRAWAL_CLAIMED,
            },
            {
                name: WEBHOOK_QUEUE.WEBHOOK_TRANSFER_FUND_APEX,
            }
        ),
        VaultModule,
        ChainModule,
        UserModule,
    ],
    controllers: [WebhookController],
    providers: [
        WebhookService,
        SyncWithdrawTxProcessor,
        SyncDepositTxProcessor,
        SyncCreateVaultProcessor,
        WebhookValidatorCreateVaultProcessor,
        SyncWithdrawalClaimTxProcessor,
        SyncWithdrawalRequestedTxProcessor,
        WebhookTransferFundApexProcessor,
    ],
})
export class WebhookModule {}

import { Controller, Param, Post } from '@nestjs/common';
import { WebhookService } from '../services/webhook.service';
import { ApiExcludeController, ApiOperation, ApiTags } from '@nestjs/swagger';
import { WebhookDepositDto } from '@app/modules/webhook/dto/webhook-deposit.dto';
import { WebhookWithdrawDto } from '@app/modules/webhook/dto/webhook-withdraw.dto';
import { SuccessResponse } from '@app/modules/shared/shared.types';
import { ApiResponseDecorator } from '@app/common/decorators/api-response.decorator';
import { WebhookCreateVaultDto } from '@app/modules/webhook/dto/webhook-create-vault.dto';

@Controller('webhook')
@ApiTags('Webhook')
@ApiExcludeController()
export class WebhookController {
    constructor(private readonly webhookService: WebhookService) {}

    @Post('deposit/:vault/:txHash')
    @ApiOperation({ description: 'Deposit webhook', summary: 'Deposit webhook' })
    @ApiResponseDecorator(SuccessResponse, { description: 'Deposit webhook' })
    async deposit(@Param() params: WebhookDepositDto) {
        await this.webhookService.deposit(params);
        return { status: true, message: 'Request success' };
    }

    @Post('withdraw/:vault/:txHash')
    @ApiOperation({ description: 'Withdraw webhook', summary: 'Withdraw webhook' })
    @ApiResponseDecorator(SuccessResponse, { description: 'Withdraw webhook' })
    async withdraw(@Param() params: WebhookWithdrawDto) {
        await this.webhookService.withdraw(params);
        return { status: true, message: 'Request success' };
    }

    @Post('withdrawal-requested/:vault/:txHash')
    @ApiOperation({ description: 'Withdrawal Requested webhook', summary: 'Withdrawal Requested webhook' })
    @ApiResponseDecorator(SuccessResponse, { description: 'Withdrawal Requested webhook' })
    async WithdrawalRequested(@Param() params: WebhookWithdrawDto) {
        await this.webhookService.withdrawalRequested(params);
        return { status: true, message: 'Request success' };
    }

    @Post('withdrawal-claim/:vault/:txHash')
    @ApiOperation({ description: 'Withdrawal Claim webhook', summary: 'Withdrawal Claim webhook' })
    @ApiResponseDecorator(SuccessResponse, { description: 'Withdrawal Claim webhook' })
    async WithdrawalClaim(@Param() params: WebhookWithdrawDto) {
        await this.webhookService.WithdrawalClaim(params);
        return { status: true, message: 'Request success' };
    }

    @Post('create-vault/:chainId/:txHash')
    @ApiOperation({ description: 'Create vault webhook', summary: 'Create vault webhook' })
    @ApiResponseDecorator(SuccessResponse, { description: 'Create vault webhook' })
    async createVault(@Param() params: WebhookCreateVaultDto) {
        await this.webhookService.createVault(params);
        return { status: true, message: 'Request success' };
    }
}

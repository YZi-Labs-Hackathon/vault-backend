import { Injectable } from '@nestjs/common';
import { RequestInterface, RequestService } from '@app/modules/shared/services/request.service';
import { VaultValidatorEVM } from '@app/modules/shared/shared.types';
import {
    DepositToVaultDto,
    GetSignatureCreateVaultDto,
    RequestClaimDto,
    RequestWithdrawDto,
    VenusWithdrawDto,
} from '@app/modules/shared/dto';
import { CreateVaultActionDto } from '@app/modules/vault/dto';

@Injectable()
export class VaultValidatorService {
    private readonly VAULT_VALIDATOR_URL =
        process.env.VAULT_VALIDATOR_URL || 'https://vault-hackathon-validator.mirailabs.co';

    constructor(private readonly requestService: RequestService) {}

    async validateEVMAction(payload: VaultValidatorEVM) {
        const requestData: RequestInterface = {
            url: `${this.VAULT_VALIDATOR_URL}/validators/validate-evm`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            data: payload,
        };
        return await this.requestService.request(requestData);
    }

    async createVault(payload: GetSignatureCreateVaultDto) {
        console.log(`[VaultValidatorService] createVault payload`, payload);
        const requestData: RequestInterface = {
            url: `${this.VAULT_VALIDATOR_URL}/validators/validate-action/vault/create-vault`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            data: payload,
        };
        return await this.requestService.request(requestData);
    }

    async getVaultValue(vaultAddress: string) {
        const requestData: RequestInterface = {
            url: `${this.VAULT_VALIDATOR_URL}/vault/${vaultAddress}/tvl`,
            method: 'GET',
        };
        return await this.requestService.request(requestData);
    }

    async depositVault(payload: DepositToVaultDto) {
        console.log(`[VaultValidatorService] DepositToVaultDto payload`, payload);
        const requestData: RequestInterface = {
            url: `${this.VAULT_VALIDATOR_URL}/validators/validate-action/vault/deposit-vault`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            data: payload,
        };
        return await this.requestService.request(requestData);
    }

    async createVaultWebhook(payload: { vaultAddress: string; vaultId: string }) {
        const requestData: RequestInterface = {
            url: `${this.VAULT_VALIDATOR_URL}/validators/validate-action/vault/create-vault/webhook`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            data: payload,
        };
        return await this.requestService.request(requestData);
    }

    async requestWithdraw(payload: RequestWithdrawDto) {
        const requestData: RequestInterface = {
            url: `${this.VAULT_VALIDATOR_URL}/validators/validate-action/vault/request-withdraw`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            data: payload,
        };
        return await this.requestService.request(requestData);
    }

    async claimWithdraw(payload: RequestClaimDto) {
        console.log(`claimWithdraw`, payload);
        const requestData: RequestInterface = {
            url: `${this.VAULT_VALIDATOR_URL}/validators/validate-action/vault/claim`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            data: payload,
        };
        return await this.requestService.request(requestData);
    }

    async getSignatureWithdraw(payload: VenusWithdrawDto) {
        const requestData: RequestInterface = {
            url: `${this.VAULT_VALIDATOR_URL}/validators/validate-action/vault/withdraw`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            data: payload,
        };
        return await this.requestService.request(requestData);
    }

    async syncAssetsApex(vaultAddress: string) {
        const requestData: RequestInterface = {
            url: `${this.VAULT_VALIDATOR_URL}/apex/sync-asset?vaultAddress=${vaultAddress}`,
            method: 'GET',
        };
        return await this.requestService.request(requestData);
    }

    async webhookTransferFundPerp(payload: { vaultAddress: string; amount: string }) {
        const requestData: RequestInterface = {
            url: `${this.VAULT_VALIDATOR_URL}/apex/transfer-fund-perp`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            data: payload,
        };
        return await this.requestService.request(requestData);
    }

    async executeAction(payload: CreateVaultActionDto) {
        const requestData: RequestInterface = {
            url: `${this.VAULT_VALIDATOR_URL}/validators/validate-action/protocol/raw-action`,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            data: payload,
        };
        return await this.requestService.request(requestData);
    }
}

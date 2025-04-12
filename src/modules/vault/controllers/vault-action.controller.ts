import { Controller, Post, Body } from '@nestjs/common';
import { VaultService } from '../services/vault.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateVaultActionDto } from '../dto';
import { ApiResponseDecorator } from '@app/common/decorators/api-response.decorator';
import { VaultActionData } from '../vault.types';
@Controller('vault/action')
@ApiTags('Vault')
export class VaultActionController {
    constructor(private readonly vaultService: VaultService) {}

    @Post()
    @ApiResponseDecorator(VaultActionData, { status: 200, description: 'Signature vault action' })
    @ApiOperation({ summary: 'Create Vault Action', description: 'Create vault action' })
    async executeActionFromProtocol(@Body() payload: CreateVaultActionDto) {
        return this.vaultService.executeActionFromProtocol(payload);
    }
}

import { Body, Controller, Get, HttpCode, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SuccessResponse } from '@app/modules/shared/shared.types';
import { ApiResponseArrayDecorator, ApiResponseDecorator } from '@app/common/decorators/api-response.decorator';
import { Vault } from '@app/modules/vault/entities/vault.entity';
import { JWTGuard } from '@app/modules/auth/guards/jwt.guard';
import { CurrentUser } from '@app/common/decorators';
import { UserVaultData } from '@app/modules/auth/auth.types';
import { UserService } from '@app/modules/user/services/user.service';
import { CheckVaultNameData, CreateVaultData } from '@app/modules/vault/vault.types';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { VaultTransaction } from '@app/modules/vault/entities/vault-transaction.entity';
import { QueryPaginateDto } from '@app/modules/shared/dto';
import {
    CreatorCreateVaultActionDto,
    CreatorCreateVaultDto,
    CreatorFilterVaultActivityDto,
    CreatorFilterVaultTransactionDto,
} from '@app/modules/user/dto';
import { VaultActivity } from '@app/modules/vault/entities/vault-activity.entity';
import { CreatorFilterVaultDto } from '@app/modules/user/dto/creator-filter-vault.dto';
import { CreatorUpdateVaultDto } from '@app/modules/user/dto/creator-update-vault.dto';

@Controller('creator/vault')
@ApiTags('Creator')
@ApiBearerAuth('accessBearer')
@UseGuards(JWTGuard)
export class CreatorVaultController {
    constructor(private readonly userService: UserService) {}

    @Get()
    @ApiOperation({
        description: 'Get a list of vaults created by the creator',
        summary: 'Get Creators Vaults List',
    })
    @ApiResponseArrayDecorator(Vault, { status: 200, description: 'Get a list of vaults created by the creator' })
    async getCreatorsVaultsList(
        @CurrentUser() user: UserVaultData,
        @Query() filter: CreatorFilterVaultDto,
        @Query() page: QueryPaginateDto
    ) {
        return await this.userService.getCreatorsVaultsList(user, filter, page);
    }

    @Get(':vaultId/transactions')
    @ApiOperation({
        description: 'Get a list of transactions of vault with pagination',
        summary: 'Get a list of transactions of vault with pagination',
    })
    @ApiPaginatedResponse(VaultTransaction)
    async getVaultTransactions(
        @CurrentUser() user: UserVaultData,
        @Param('vaultId', ParseUUIDPipe) vaultId: string,
        @Query() filter: CreatorFilterVaultTransactionDto,
        @Query() paginate: QueryPaginateDto
    ) {
        return await this.userService.getVaultTransactions(user, vaultId, filter, paginate);
    }

    @Get(':vaultId/activities')
    @ApiOperation({
        description: 'Get a list of activities of vault with pagination',
        summary: 'Get a list of activities of vault with pagination',
    })
    @ApiPaginatedResponse(VaultActivity)
    async getVaultActivities(
        @CurrentUser() user: UserVaultData,
        @Param('vaultId', ParseUUIDPipe) vaultId: string,
        @Query() filter: CreatorFilterVaultActivityDto,
        @Query() paginate: QueryPaginateDto
    ) {
        return await this.userService.getVaultActivities(user, vaultId, filter, paginate);
    }

    @Get(':vaultId/deploy')
    @ApiOperation({
        description: 'Get signature for deploy vault',
        summary: 'Get signature for deploy vault',
    })
    @ApiResponseDecorator(CreateVaultData, { status: 200, description: 'Get signature for deploy vault' })
    async getSignatureForDeployVault(
        @CurrentUser() user: UserVaultData,
        @Param('vaultId', ParseUUIDPipe) vaultId: string
    ) {
        return await this.userService.getSignatureForDeployVault(user, vaultId);
    }

    @Post()
    @ApiOperation({ summary: 'Create vault', description: 'Create vault' })
    @ApiResponseDecorator(CreateVaultData, { status: 200, description: 'Create vault' })
    @HttpCode(200)
    async createVault(@CurrentUser() user: UserVaultData, @Body() payload: CreatorCreateVaultDto) {
        return this.userService.createVault(user, payload);
    }

    @Post('check-name/:name')
    @ApiOperation({ summary: 'Check vault name', description: 'Check vault name' })
    @ApiResponseDecorator(CheckVaultNameData, { status: 200, description: 'Check vault name' })
    async checkVaultName(@Param('name') name: string) {
        return await this.userService.checkVaultName(name);
    }

    @Patch(':vaultId')
    @ApiOperation({ summary: 'Update vault', description: 'Update vault' })
    @ApiResponseDecorator(SuccessResponse, { status: 200, description: 'Vault updated successfully' })
    async updateVault(@Body() payload: CreatorUpdateVaultDto, @Param('vaultId', ParseUUIDPipe) vaultId: string) {
        await this.userService.updateVault(vaultId, payload);
        return { status: true, message: 'Vault updated successfully' };
    }
}

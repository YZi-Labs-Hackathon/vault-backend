import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBasicAuth, ApiBearerAuth, ApiExcludeEndpoint, ApiOperation, ApiTags } from '@nestjs/swagger';
import { FilterVaultDto } from '@app/modules/vault/dto/filter-vault.dto';
import { QueryPaginateDto } from '@app/modules/shared/dto';
import { ApiResponseArrayDecorator, ApiResponseDecorator } from '@app/common/decorators/api-response.decorator';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { VaultDao } from '@app/modules/vault/dao/vault.dao';
import { CreateVaultData, VaultTVLAndPnlData } from '@app/modules/vault/vault.types';
import { Vault } from '@app/modules/vault/entities/vault.entity';
import { VaultService } from '@app/modules/vault/services/vault.service';
import { JWTGuard } from '@app/modules/auth/guards/jwt.guard';
import { CurrentUser } from '@app/common/decorators';
import { IUserVaultPayload } from '@app/modules/user/user.type';
import { SuccessResponse } from '@app/modules/shared/shared.types';
import { CreateVaultDto } from '@app/modules/vault/dto';
import { FilterVaultPntDto } from '@app/modules/vault/dto/filter-vault-pnl.dto';
import { ApiKeyGuard } from '@app/modules/shared/guards';
import { FilterVaultProtocolDto } from '@app/modules/vault/dto/filter-vault-protocol.dto';
import { VAULT_STATUS } from '@app/modules/vault/vault.constants';
import { CreatorFilterVaultDto } from '@app/modules/user/dto/creator-filter-vault.dto';
import { CreatorUpdateVaultDto } from '@app/modules/user/dto/creator-update-vault.dto';

@Controller('vault')
@ApiTags('Vault')
export class VaultController {
    constructor(private readonly vaultService: VaultService) {}

    @Get('syncPnl/:vaultId')
    @ApiOperation({
        description: 'Deploy vaults',
        summary: 'Deploy vaults',
    })
    async syncPnl(@Param('vaultId') vaultIdL: string) {
        return this.vaultService.syncPnlWithDraw(vaultIdL);
    }

    @Get('tvl/:vaultId')
    @ApiExcludeEndpoint()
    @ApiOperation({
        description: 'Get vault tvl',
        summary: 'Get Vault TVL',
    })
    async getVaultTvl(@Param('vaultId', ParseUUIDPipe) vaultId: string) {
        return await this.vaultService.getVaultTvl(vaultId);
    }

    @Get('list')
    @UseGuards(JWTGuard)
    @ApiBasicAuth('accessBearer')
    @ApiResponseArrayDecorator(Vault)
    async getVaultsLists(
        @Query() filter: FilterVaultDto,
        @CurrentUser() currentUser: IUserVaultPayload,
        @Query() page: QueryPaginateDto
    ) {
        filter.filterStatus = `${VAULT_STATUS.PAUSE},${VAULT_STATUS.CLOSE},${VAULT_STATUS.ACTIVE}`;
        return await this.vaultService.getLisVault(filter, page, currentUser);
    }

    @Get('pnl')
    @ApiOperation({
        description: 'Get Vault tvl & pnl',
        summary: 'Get Vault tvl & pnl',
    })
    @ApiResponseDecorator(VaultTVLAndPnlData, { status: 200, description: 'Get Vault tvl & pnl' })
    async getVaultPnl(@CurrentUser() user: IUserVaultPayload) {
        return await this.vaultService.getVaultPnl(user);
    }

    @Get('protocol')
    @ApiOperation({
        description: 'Get a list protocol',
        summary: 'Get a list protocol',
    })
    @ApiResponseArrayDecorator(Vault, { status: 200, description: 'Get a list protocol' })
    async getProtocolVault(@Query() filter: FilterVaultProtocolDto) {
        return this.vaultService.getProtocolVault(filter);
    }

    @Get()
    @ApiOperation({
        description: 'Get a list of vaults created by the creator',
        summary: 'Get Creators Vaults List',
    })
    @UseGuards(JWTGuard)
    @ApiBasicAuth('accessBearer')
    @ApiResponseArrayDecorator(Vault, { status: 200, description: 'Get a list of vaults created by the creator' })
    async getCreatorsVaultsList(@Query() filter: CreatorFilterVaultDto, @CurrentUser() currentUser: IUserVaultPayload) {
        return this.vaultService.getCreatorsVaultsList(filter, currentUser);
    }

    @Get('detail')
    @ApiOperation({
        description: 'Get vault details',
        summary: 'Get Vault Details',
    })
    @UseGuards(JWTGuard)
    @ApiBasicAuth('accessBearer')
    @ApiResponseDecorator(Vault, { status: 200, description: 'Get vault details' })
    async getVaultDetails(@CurrentUser() user: IUserVaultPayload, @Query() filter: FilterVaultDto) {
        return this.vaultService.getDetailVaults(user, filter);
    }

    @Get('detail/public')
    @ApiOperation({
        description: 'Get vault details public',
        summary: 'Get Vault Details public',
    })
    @ApiResponseDecorator(Vault, { status: 200, description: 'Get vault details' })
    async getVaultDetailsPublic(@CurrentUser() user: IUserVaultPayload, @Query() filter: FilterVaultDto) {
        return this.vaultService.getDetailVaults(user, filter);
    }

    @Post()
    @ApiOperation({ summary: 'Create vault', description: 'Create vault' })
    @ApiResponseDecorator(CreateVaultData, { status: 200, description: 'Create vault' })
    @UseGuards(JWTGuard)
    @ApiBasicAuth('accessBearer')
    async createVault(@Body() payload: CreateVaultDto, @CurrentUser() user: IUserVaultPayload) {
        return this.vaultService.createVault(payload);
    }

    @Post('active/:vaultId')
    @ApiOperation({ summary: 'Active vault', description: 'Active vault' })
    @ApiResponseDecorator(SuccessResponse, { status: 200, description: 'Active vault' })
    @UseGuards(ApiKeyGuard)
    @ApiBearerAuth('apiKey')
    async activeVault(@Param('vaultId') vaultId: string) {
        await this.vaultService.activeVault(vaultId);
        return { message: 'Active vault', status: true };
    }

    @Patch(':vaultId')
    @ApiOperation({ summary: 'Update vault', description: 'Update vault' })
    @ApiResponseDecorator(SuccessResponse, { status: 200, description: 'Vault updated successfully' })
    @UseGuards(JWTGuard)
    @ApiBasicAuth('accessBearer')
    async updateVault(
        @Body() payload: CreatorUpdateVaultDto,
        @CurrentUser() user: IUserVaultPayload,
        @Param('vaultId', ParseUUIDPipe) vaultId: string
    ) {
        return await this.vaultService.updateVault(vaultId, payload, user);
    }

    @Post('approve/withdraw/all/:vaultId')
    @ApiOperation({ summary: 'Approve all withdraw request', description: 'Approve all withdraw request' })
    @ApiResponseDecorator(SuccessResponse, { status: 200, description: 'Approve all withdraw request' })
    @UseGuards(JWTGuard)
    @ApiBasicAuth('accessBearer')
    async approveAllWithdrawVaultRequests(
        @Param('vaultId', ParseUUIDPipe) vaultId: string,
        @CurrentUser() user: IUserVaultPayload
    ) {
        return await this.vaultService.approveAllWithdrawVaultRequests(vaultId, user);
    }

    @ApiOperation({
        description: 'Get vaults list have authentication',
        summary: 'Get vaults list have authentication',
    })
    @Get('paginate')
    @ApiOperation({
        description: 'Get vaults list with pagination',
        summary: 'Get Vaults List with Pagination',
    })
    @UseGuards(JWTGuard)
    @ApiBasicAuth('accessBearer')
    @ApiPaginatedResponse(VaultDao)
    async getFeaturedVaultsList(@Query() filter: FilterVaultDto, @Query() paginate: QueryPaginateDto) {
        return 'Featured Vaults List';
    }

    @ApiOperation({
        description: 'Get pnl details',
        summary: 'Get pnl Details',
    })
    @Get('pnl/:vaultId')
    async getVaultPnlDetails(@Param('vaultId', ParseUUIDPipe) vaultId: string, @Query() filter: FilterVaultPntDto) {
        return 'Vault pnl Details';
    }

    @ApiOperation({
        description: 'Get vaults list',
        summary: 'Get Vaults List',
    })
    @Get('public')
    @ApiResponseArrayDecorator(Vault)
    async getVaultsList(@Query() filter: FilterVaultDto, @Query() paginate: QueryPaginateDto) {
        filter.filterStatus = `${VAULT_STATUS.PAUSE},${VAULT_STATUS.CLOSE},${VAULT_STATUS.ACTIVE}`;
        return await this.vaultService.getLisVault(filter, paginate);
    }
}

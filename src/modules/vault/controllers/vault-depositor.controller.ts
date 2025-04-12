import { ApiBasicAuth, ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, UseGuards } from '@nestjs/common';
import { FilterVaultActivityDto, VaultDepositDto } from '@app/modules/vault/dto';
import { QueryPaginateDto } from '@app/modules/shared/dto';
import { VaultDepositorService } from '@app/modules/vault/services/vault-depositor.service';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { DepositorHistory } from '@app/modules/vault/dao/history.depositor.dao';
import { VaultTransaction } from '@app/modules/vault/entities/vault-transaction.entity';
import { FilterVaultTransactionDto } from '@app/modules/vault/dto/filter-vault-transaction.dto';
import { ApiResponseDecorator } from '@app/common/decorators/api-response.decorator';
import { UserWithdrawData, VaultDepositData, VaultWithDrawState } from '@app/modules/vault/vault.types';
import { VaultWithdrawDto } from '@app/modules/vault/dto/vault-withdraw.dto';
import { JWTGuard } from '@app/modules/auth/guards/jwt.guard';
import { UserVaultData } from '@app/modules/auth/auth.types';
import { CurrentUser } from '@app/common/decorators';
import { IUserVaultPayload } from '@app/modules/user/user.type';

@Controller('vault/depositor')
@ApiTags('Vault', 'User')
export class VaultDepositorController {
    constructor(private readonly vaultDepositorService: VaultDepositorService) {}

    @Get('transactions')
    @ApiOperation({
        description: 'Get all depositors transactions with pagination',
        summary: 'Get all Depositors Transactions with Pagination',
    })
    @UseGuards(JWTGuard)
    @ApiBasicAuth('accessBearer')
    @ApiPaginatedResponse(VaultTransaction)
    async getDepositorsTransactions(
        @Query() filter?: FilterVaultTransactionDto,
        @Query() paginate?: QueryPaginateDto,
        @CurrentUser() user?: IUserVaultPayload
    ) {
        return await this.vaultDepositorService.getDepositorsTransactions(filter, paginate, user);
    }

    @Get('withdraw/:vaultId')
    @ApiOperation({
        description: 'Get Withdraw State',
        summary: 'Get Withdraw State',
    })
    @UseGuards(JWTGuard)
    @ApiBasicAuth('accessBearer')
    @ApiResponseDecorator(VaultWithDrawState, { status: 200, description: 'Get Withdraw State' })
    async getWithdrawState(@Param('vaultId', ParseUUIDPipe) vaultId: string, @CurrentUser() user: IUserVaultPayload) {
        return this.vaultDepositorService.getWithdrawState(vaultId, user);
    }

    @Get(':vaultId')
    @ApiOperation({
        description: 'Get all depositors of a specific vault with pagination',
        summary: 'Get all Depositors with Pagination',
    })
    @ApiPaginatedResponse(DepositorHistory)
    async getDepositors(
        @Param('vaultId', ParseUUIDPipe) vaultId: string,
        @Query() filter: FilterVaultActivityDto,
        @Query() paginate: QueryPaginateDto
    ) {
        return await this.vaultDepositorService.getDepositorsOfVault(vaultId, paginate);
    }

    @Post('deposit')
    @ApiBearerAuth('accessBearer')
    @UseGuards(JWTGuard)
    @ApiOperation({ summary: 'Deposit to vault', description: 'Deposit to vault' })
    @ApiResponseDecorator(VaultDepositData, { status: 200, description: 'Deposit to vault' })
    async depositToVault(@CurrentUser() user: UserVaultData, @Body() payload: VaultDepositDto) {
        return await this.vaultDepositorService.depositToVault(user, payload);
    }

    @Post('withdraw')
    @ApiBearerAuth('accessBearer')
    @UseGuards(JWTGuard)
    @ApiOperation({ summary: 'Request Withdraw from user vault', description: 'Request Withdraw from user vault' })
    @ApiResponseDecorator(UserWithdrawData, { status: 200, description: 'Request Withdraw from user vault data' })
    async withdrawFromUserVault(@CurrentUser() user: UserVaultData, @Body() payload: VaultWithdrawDto) {
        return await this.vaultDepositorService.withdrawFromVault(user, payload);
    }
}

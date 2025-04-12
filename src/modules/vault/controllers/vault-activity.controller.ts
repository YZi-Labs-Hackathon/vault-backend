import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { VaultActivityService } from '@app/modules/vault/services/vault-activity.service';
import { FilterVaultActivityDto } from '@app/modules/vault/dto';
import { QueryPaginateDto } from '@app/modules/shared/dto';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { HistoryActivity } from '@app/modules/vault/dao/history.activity.dao';

@Controller('vault/activities')
@ApiTags('Vault')
export class VaultActivityController {
    constructor(private readonly vaultActivityService: VaultActivityService) {}

    @ApiOperation({
        description: 'Get all vault activities with pagination',
        summary: 'Get all Vault Activities with Pagination',
    })
    @Get(':vaultId')
    @ApiPaginatedResponse(HistoryActivity)
    async getVaultActivities(
        @Param('vaultId', ParseUUIDPipe) vaultId: string,
        @Query() filter: FilterVaultActivityDto,
        @Query() paginate: QueryPaginateDto
    ) {
        return this.vaultActivityService.getVaultActivities(vaultId, filter, paginate);
    }
}

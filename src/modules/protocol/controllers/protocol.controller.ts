import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Protocol } from '@app/modules/protocol/entities/protocol.entity';
import { ApiResponseArrayDecorator, ApiResponseDecorator } from '@app/common/decorators/api-response.decorator';
import { CreateProtocolDto, FilterProtocolDto, UpdateProtocolDto } from '@app/modules/protocol/dto';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { QueryPaginateDto } from '@app/modules/shared/dto';
import { ProtocolService } from '@app/modules/protocol/services/protocol.service';
import { SuccessResponse } from '@app/modules/shared/shared.types';
import { ApiKeyGuard } from '@app/modules/shared/guards';

@Controller('protocol')
@ApiTags('Protocol')
export class ProtocolController {
    constructor(private readonly protocolService: ProtocolService) {}

    @Post()
    @UseGuards(ApiKeyGuard)
    @ApiBearerAuth('apiKey')
    @ApiOperation({ summary: 'Create protocols', description: 'Create protocols' })
    @ApiResponseDecorator(Protocol, { description: 'Create protocols' })
    async createProtocol(@Body() payload: CreateProtocolDto) {
        return this.protocolService.add(payload);
    }

    @Get()
    @ApiOperation({
        description: 'Get protocols list',
        summary: 'Get Protocols List',
    })
    @ApiResponseArrayDecorator(Protocol, { description: 'Get Protocols List' })
    async getProtocolsList(@Query() filter: FilterProtocolDto) {
        return await this.protocolService.getAll(filter);
    }

    @Get('paginate')
    @ApiOperation({
        description: 'Get protocols list paginate',
        summary: 'Get Protocols List Paginate',
    })
    @ApiPaginatedResponse(Protocol)
    async getProtocolsListPaginate(@Query() filter: FilterProtocolDto, @Query() paginate: QueryPaginateDto) {
        return await this.protocolService.getAllPaginate(filter, paginate);
    }

    @ApiOperation({
        description: 'Get protocols details',
        summary: 'Get Protocol Details',
    })
    @ApiResponseDecorator(Protocol, { description: 'Get Protocol Details' })
    @Get(':id')
    async getProtocolDetails(@Param('id', ParseUUIDPipe) id: string) {
        return await this.protocolService.detail(id);
    }

    @Patch(':id')
    @UseGuards(ApiKeyGuard)
    @ApiBearerAuth('apiKey')
    @ApiOperation({ summary: 'Update protocols', description: 'Update protocols' })
    @ApiResponseDecorator(SuccessResponse, { description: 'Update protocols' })
    async updateProtocol(@Param('id', ParseUUIDPipe) id: string, @Body() payload: UpdateProtocolDto) {
        await this.protocolService.edit(id, payload);
        return { status: true, message: 'Update protocols success' };
    }
}

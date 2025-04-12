import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ChainService } from '../services/chain.service';
import { CreateChainDto } from '../dto/create-chain.dto';
import { UpdateChainDto } from '../dto/update-chain.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiKeyGuard } from '@app/modules/shared/guards';
import { Chain } from '@app/modules/chain/entities/chain.entity';
import { ApiResponseArrayDecorator, ApiResponseDecorator } from '@app/common/decorators/api-response.decorator';
import { FilterChainDto } from '@app/modules/chain/dto/filter-chain.dto';
import { SuccessResponse } from '@app/modules/shared/shared.types';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { QueryPaginateDto } from '@app/modules/shared/dto';

@Controller('chain')
@ApiTags('Chain')
export class ChainController {
    constructor(private readonly chainService: ChainService) {}

    @UseGuards(ApiKeyGuard)
    @ApiBearerAuth('apiKey')
    @Post()
    @ApiOperation({ summary: 'Create chain', description: 'Create chain' })
    @ApiResponseDecorator(Chain, { description: 'Create chain' })
    create(@Body() createChainDto: CreateChainDto) {
        return this.chainService.add(createChainDto);
    }

    @Get()
    @ApiOperation({ summary: 'Retrieve all chains', description: 'Retrieve all chains' })
    @ApiResponseArrayDecorator(Chain, { description: 'Retrieve all chains' })
    findAll(@Query() filter: FilterChainDto) {
        return this.chainService.getAll(filter);
    }

    @Get('paginate')
    @ApiOperation({
        summary: 'Retrieve all chains with pagination',
        description: 'Retrieve all chains with pagination',
    })
    @ApiPaginatedResponse(Chain)
    async getAllChainsPaginate(@Query() filter: FilterChainDto, @Query() paginate: QueryPaginateDto) {
        return await this.chainService.getPaginate(filter, paginate);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Retrieve chain details', description: 'Retrieve chain details' })
    @ApiResponseDecorator(Chain, { description: 'Retrieve chain details' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.chainService.detail(id);
    }

    @UseGuards(ApiKeyGuard)
    @ApiBearerAuth('apiKey')
    @Patch(':id')
    @ApiOperation({ summary: 'Update chain', description: 'Update chain' })
    @ApiResponseDecorator(SuccessResponse, { description: 'Update chain' })
    async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateChainDto: UpdateChainDto) {
        await this.chainService.edit(id, updateChainDto);
        return { status: true, message: 'Update chain success' };
    }
}

import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ActionService } from '@app/modules/protocol/services/action.service';
import { Action } from '@app/modules/protocol/entities/action.entity';
import { ApiResponseArrayDecorator, ApiResponseDecorator } from '@app/common/decorators/api-response.decorator';
import { CreateActionDto, FilterActionDto, UpdateActionDto } from '@app/modules/protocol/dto';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { QueryPaginateDto } from '@app/modules/shared/dto';
import { SuccessResponse } from '@app/modules/shared/shared.types';
import { ApiKeyGuard } from '@app/modules/shared/guards';

@Controller('action')
@ApiTags('Action')
export class ActionController {
    constructor(private readonly actionService: ActionService) {}

    @Post()
    @UseGuards(ApiKeyGuard)
    @ApiBearerAuth('apiKey')
    @ApiOperation({ summary: 'Create action', description: 'Create action' })
    @ApiResponseDecorator(Action, { description: 'Create action' })
    async createAction(@Body() payload: CreateActionDto): Promise<any> {
        return this.actionService.create(payload);
    }

    @Patch(':id')
    @UseGuards(ApiKeyGuard)
    @ApiBearerAuth('apiKey')
    @ApiOperation({ summary: 'Update action', description: 'Update action' })
    @ApiResponseDecorator(SuccessResponse, { description: 'Update action' })
    async updateAction(@Param('id', ParseUUIDPipe) id: string, @Body() payload: UpdateActionDto): Promise<any> {
        await this.actionService.update(id, payload);
        return { status: true, message: 'Update action success' };
    }

    @Get()
    @ApiOperation({ summary: 'Retrieve all actions', description: 'Retrieve all actions' })
    @ApiResponseArrayDecorator(Action, { description: 'Retrieve all actions' })
    async getAllActions(@Query() filter: FilterActionDto) {
        return await this.actionService.getAll(filter);
    }

    @Get('paginate')
    @ApiOperation({
        summary: 'Retrieve all actions with pagination',
        description: 'Retrieve all actions with pagination',
    })
    @ApiPaginatedResponse(Action)
    async getAllActionsPaginate(@Query() filter: FilterActionDto, @Query() paginate: QueryPaginateDto) {
        return await this.actionService.getAllPaginate(filter, paginate);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Retrieve action details', description: 'Retrieve action details' })
    @ApiResponseDecorator(Action, { description: 'Retrieve action details' })
    async getActionDetails(@Param('id', ParseUUIDPipe) id: string) {
        return await this.actionService.detail(id);
    }
}

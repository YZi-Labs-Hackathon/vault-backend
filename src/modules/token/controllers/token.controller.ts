import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CreateTokenDto } from '../dto/create-token.dto';
import { UpdateTokenDto } from '../dto/update-token.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { TokenService } from '@app/modules/token/services/token.service';
import { Token } from '@app/modules/token/entities/token.entity';
import { ApiResponseArrayDecorator, ApiResponseDecorator } from '@app/common/decorators/api-response.decorator';
import { FilterTokenDto } from '@app/modules/token/dto/filter-token.dto';
import { SuccessResponse } from '@app/modules/shared/shared.types';
import { ApiPaginatedResponse } from '@app/common/decorators/api-paginated-response.decorator';
import { QueryPaginateDto } from '@app/modules/shared/dto';
import { ApiKeyGuard } from '@app/modules/shared/guards';

@Controller('token')
@ApiTags('Token')
export class TokenController {
    constructor(private readonly tokenService: TokenService) {}

    @Post()
    @UseGuards(ApiKeyGuard)
    @ApiBearerAuth('apiKey')
    @ApiOperation({ summary: 'Create token', description: 'Create token' })
    @ApiResponseDecorator(Token, { description: 'Create token' })
    create(@Body() createTokenDto: CreateTokenDto) {
        return this.tokenService.add(createTokenDto);
    }

    @Get('paginate')
    @ApiOperation({ summary: 'Get all token with pagination', description: 'Get all token with pagination' })
    @ApiPaginatedResponse(Token)
    async paginate(@Query() filter: FilterTokenDto, @Query() paginate: QueryPaginateDto) {
        return this.tokenService.getPaginate(filter, paginate);
    }

    @Get()
    @ApiOperation({ summary: 'Get all token', description: 'Get all token' })
    @ApiResponseArrayDecorator(Token, { description: 'Get all token' })
    findAll(@Query() filter: FilterTokenDto) {
        return this.tokenService.getAll(filter);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get token by id', description: 'Get token by id' })
    @ApiResponseDecorator(Token, { description: 'Get token by id' })
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.tokenService.detail(id);
    }

    @Patch(':id')
    @UseGuards(ApiKeyGuard)
    @ApiBearerAuth('apiKey')
    @ApiOperation({ summary: 'Update token', description: 'Update token' })
    @ApiResponseDecorator(SuccessResponse, { description: 'Update token' })
    async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateTokenDto: UpdateTokenDto) {
        await this.tokenService.edit(id, updateTokenDto);
        return { status: true, message: 'Token updated successfully' };
    }
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { ACTION_COMMAND } from '@app/modules/protocol/protocol.constants';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { STATUS } from '@app/modules/shared/shared.constants';

export class FilterActionDto {
    @ApiPropertyOptional({ type: String, description: 'The id of the action' })
    @IsOptional()
    @IsUUID('4')
    id?: string;

    @ApiPropertyOptional({ type: String, description: 'The command of the action', enum: ACTION_COMMAND })
    @IsOptional()
    @IsEnum(ACTION_COMMAND)
    command?: string;

    @ApiPropertyOptional({ type: String, description: 'The name of the protocols' })
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({ type: Number, description: 'The status of the protocols', default: STATUS.ACTIVE })
    @IsOptional()
    @IsEnum(STATUS)
    status?: number;

    @ApiPropertyOptional({ type: String, description: 'The id of the protocols' })
    @IsOptional()
    @IsUUID('4')
    protocolId?: string;
}

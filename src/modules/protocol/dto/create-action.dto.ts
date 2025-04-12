import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ACTION_COMMAND } from '@app/modules/protocol/protocol.constants';
import { STATUS } from '@app/modules/shared/shared.constants';
import { ActionMetadata } from '@app/modules/protocol/entities/action.entity';
import { IsEnum, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateActionDto {
    @ApiProperty({ type: String, description: 'The command of the action', enum: ACTION_COMMAND })
    @IsNotEmpty()
    @IsEnum(ACTION_COMMAND)
    command: string;

    @ApiProperty({ type: String, description: 'The name of the protocols' })
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({ description: 'The metadata of the action', type: ActionMetadata })
    @IsOptional()
    @Type(() => ActionMetadata)
    @ValidateNested()
    metadata?: ActionMetadata;

    @ApiPropertyOptional({ type: Number, description: 'The status of the protocols', default: STATUS.ACTIVE })
    @IsOptional()
    @IsEnum(STATUS)
    status?: number;
}

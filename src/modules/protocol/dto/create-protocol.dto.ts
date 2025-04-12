import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { STATUS } from '@app/modules/shared/shared.constants';
import { IsEnum, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { PROTOCOL_SERVICE } from '@app/modules/protocol/protocol.type';
import { CreateProtocolActionDto } from './create-protocol-action.dto';
import { Type } from 'class-transformer';
import { CreateProtocolTokenDto } from './create-protocol-token.dto';

export class _CreateProtocolActionDto extends OmitType(CreateProtocolActionDto, ['protocolId'] as const) {}

export class _CreateProtocolTokenDto extends OmitType(CreateProtocolTokenDto, ['protocolId'] as const) {}

export class CreateProtocolDto {
    @ApiProperty({ type: String, description: 'The service of the protocols', enum: PROTOCOL_SERVICE })
    @IsNotEmpty()
    @IsEnum(PROTOCOL_SERVICE, { message: 'service must be a valid PROTOCOL_SERVICE' })
    service: string;

    @ApiProperty({ type: String, description: 'The name of the protocols' })
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({ type: String, description: 'The strategy address of the protocol' })
    @IsOptional()
    strategy?: string;

    @ApiPropertyOptional({ type: String, description: 'The image of the protocols' })
    @IsOptional()
    image?: string;

    @ApiPropertyOptional({ type: String, description: 'The description of the protocols' })
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ type: Number, description: 'The total TVL of the protocols' })
    @IsOptional()
    totalTVL?: number;

    @ApiPropertyOptional({ type: Number, description: 'The total earned of the protocols' })
    @IsOptional()
    totalEarned?: number;

    @ApiPropertyOptional({ type: Number, description: 'The total deposits of the protocols' })
    @IsOptional()
    totalDeposits?: number;

    @ApiPropertyOptional({ type: Number, description: 'The total withdrawals of the protocols' })
    @IsOptional()
    totalWithdrawals?: number;

    @ApiPropertyOptional({ type: Number, description: 'The total users of the protocols' })
    @IsOptional()
    totalUsers?: number;

    @ApiPropertyOptional({ type: [String], description: 'The supported chains of the vault' })
    @IsOptional()
    supportedChainIds?: string[];

    @ApiPropertyOptional({ type: [String], description: 'The tags of the protocols' })
    @IsOptional()
    tags?: string[];

    @ApiPropertyOptional({ type: Number, description: 'The status of the protocols', default: STATUS.ACTIVE })
    @IsOptional()
    @IsEnum(STATUS)
    status?: number;

    @ApiPropertyOptional({ type: [_CreateProtocolActionDto], description: 'The actions of the protocols' })
    @IsOptional()
    @Type(() => _CreateProtocolActionDto)
    @ValidateNested({ each: true })
    actions?: _CreateProtocolActionDto[];

    @ApiPropertyOptional({ type: Object, description: 'The data of the protocols' })
    @IsOptional()
    data?: any;

    @ApiPropertyOptional({ type: [_CreateProtocolTokenDto], description: 'The tokens of the protocols' })
    @IsOptional()
    @Type(() => _CreateProtocolTokenDto)
    @ValidateNested({ each: true })
    tokens?: _CreateProtocolTokenDto[];
}

import { ApiProperty, ApiPropertyOptional, getSchemaPath } from '@nestjs/swagger';
import { STATUS } from '@app/modules/shared/shared.constants';
import { VenusBorrowMetadata, VenusStakingMetadata } from '@app/modules/protocol/entities/protocol-action.entity';
import { IsEnum, IsNotEmpty, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProtocolActionDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID('4')
    protocolId: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsUUID('4')
    actionId: string;

    @ApiPropertyOptional({
        type: VenusStakingMetadata,
        oneOf: [{ $ref: getSchemaPath(VenusStakingMetadata) }, { $ref: getSchemaPath(VenusBorrowMetadata) }],
        description: 'The metadata of the protocols action',
    })
    @IsOptional()
    @Type(() => VenusStakingMetadata)
    @ValidateNested()
    metadata?: VenusStakingMetadata;

    @ApiPropertyOptional({ type: Number, description: 'The status of the protocols', default: STATUS.ACTIVE })
    @IsOptional()
    @IsEnum(STATUS)
    status?: number;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { STATUS } from '@app/modules/shared/shared.constants';
import { PROTOCOL_SERVICE } from '@app/modules/protocol/protocol.type';

export class FilterProtocolDto {
    @ApiPropertyOptional({ type: String, description: 'The id of the protocols' })
    @IsOptional()
    @IsUUID('4')
    id?: string;

    @ApiPropertyOptional({ type: String, description: 'The service of the protocols', enum: PROTOCOL_SERVICE })
    @IsOptional()
    @IsEnum(PROTOCOL_SERVICE, { message: 'service must be a valid PROTOCOL_SERVICE' })
    service?: string;

    @ApiPropertyOptional({ type: String, description: 'The name of the protocols' })
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({ type: String, description: 'The supported chains of the vault', example: '1,56,137' })
    @IsOptional()
    supportedChainIds?: string;

    @ApiPropertyOptional({ type: String, description: 'The vault id of the protocols' })
    @IsOptional()
    @IsUUID('4')
    vaultId?: string;

    @ApiPropertyOptional({ type: Number, description: 'The status of the protocols', default: STATUS.ACTIVE })
    @IsOptional()
    @IsEnum(STATUS)
    status?: number;

    @ApiPropertyOptional({ type: String, description: 'The token id of the protocols' })
    @IsOptional()
    @IsUUID('4')
    tokenId?: string;
}

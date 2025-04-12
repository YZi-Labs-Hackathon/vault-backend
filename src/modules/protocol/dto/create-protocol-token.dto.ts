import { STATUS } from '@app/modules/shared/shared.constants';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateProtocolTokenDto {
    @ApiProperty({ description: 'The protocol id' })
    @IsNotEmpty()
    @IsUUID('4')
    protocolId: string;

    @ApiProperty({ description: 'The token id' })
    @IsNotEmpty()
    @IsUUID('4')
    tokenId: string;

    @ApiProperty({ description: 'The status of the token', default: STATUS.ACTIVE })
    @IsNotEmpty()
    @IsEnum(STATUS)
    status: number;
}

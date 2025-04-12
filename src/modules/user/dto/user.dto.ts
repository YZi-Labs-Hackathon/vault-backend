import { ChainType } from "@app/common/types";
import { ApiProperty } from "@nestjs/swagger";

export class User {
    @ApiProperty({ type: String, example: '0x1234567890123456789012345678901234567890' })
    address: string;

    @ApiProperty({ type: String, enum: ChainType, example: ChainType.EVM })
    chainType: ChainType;
}
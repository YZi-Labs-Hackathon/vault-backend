import { ApiProperty } from "@nestjs/swagger";
import { ChainType } from "./types";

export class CommonResponse {
    @ApiProperty({ type: Boolean, example: true })
    success: boolean;
}

export class Token {
    @ApiProperty({ type: String, example: 'usdc' })
    id: string;

    @ApiProperty({ type: String, example: 'USDC' })
    symbol: string;

    @ApiProperty({ type: String, example: 'USD Coin' })
    name: string;

    @ApiProperty({ type: String, example: 'https://usdc.com/logo.png' })
    image: string;
}

export class TokenAddress {
    @ApiProperty({ type: String, example: 'usdc' })
    tokenId: string;

    @ApiProperty({ type: String, example: 'USDC' })
    symbol: string;

    @ApiProperty({ type: String, example: 'USD Coin' })
    name: string;

    @ApiProperty({ type: String, example: 'https://usdc.com/logo.png' })
    image: string;

    @ApiProperty({ type: String, example: '0x1234567890123456789012345678901234567890' })
    address: string;

    @ApiProperty({ type: Number, example: 18 })
    decimals: number;
}

export class Chain {
    @ApiProperty({ type: String, example: 'bsc' })
    id: string;

    @ApiProperty({ type: String, example: 'BSC' })
    name: string;

    @ApiProperty({ type: String, example: 'https://bscscan.com/logo.png' })
    image: string;

    @ApiProperty({ type: String, example: 'https://bscscan.com' })
    explorer: string;

    @ApiProperty({ type: String, enum: ChainType, example: ChainType.EVM })
    chainType: ChainType;
}
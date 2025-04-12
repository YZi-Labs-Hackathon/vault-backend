import { CommonResponse } from "@app/common/common.dto";
import { ApiProperty } from "@nestjs/swagger";

export class Protocol {
    @ApiProperty({ type: String, example: 'venus' })
    id: string;

    @ApiProperty({ type: String, example: 'Venus' })
    name: string;

    @ApiProperty({ type: String, example: 'https://venus.io/logo.png' })
    image: string;
}

export class GetListProtocolsResponse extends CommonResponse {
    @ApiProperty({ type: [Protocol] })
    protocols: Protocol[];

    @ApiProperty({ type: Number, example: 100 })
    totalProtocols: number;
}

class ProtocolDetails extends Protocol {
    @ApiProperty({ type: Number, example: 100 })
    totalVaults: number;

    @ApiProperty({ type: String, example: '1000000000000000000' })
    totalTVL: string;

    @ApiProperty({ type: String, example: '1000000000000000000' })
    totalEarned: string;

    @ApiProperty({ type: String, example: '1000000000000000000' })
    totalDeposits: string;

    @ApiProperty({ type: String, example: '1000000000000000000' })
    totalWithdrawals: string;

    @ApiProperty({ type: Number, example: 1000 })
    totalUsers: number;

    @ApiProperty({ type: [String], example: ['deposit', 'withdraw'] })
    supportedCommands: string[];
}

export class GetProtocolDetailsResponse extends CommonResponse {
    @ApiProperty({ type: ProtocolDetails })
    protocol: ProtocolDetails;
}

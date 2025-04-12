import { ApiProperty } from '@nestjs/swagger';

export class GetSignatureCreateVaultDto {
    @ApiProperty()
    underlying: string;

    @ApiProperty()
    protocol: string;

    @ApiProperty()
    protocolHelper: string;

    @ApiProperty()
    authority: string;

    @ApiProperty()
    initialAgentDeposit: string;

    @ApiProperty()
    maxDeposit: string;

    @ApiProperty()
    minDeposit: string;

    @ApiProperty()
    shareTokenName: string;

    @ApiProperty()
    shareTokenSymbol: string;

    @ApiProperty()
    vaultId: string;

    @ApiProperty({ type: Number })
    chainId: number;
}

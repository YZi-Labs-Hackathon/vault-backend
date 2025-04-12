import { ApiProperty } from '@nestjs/swagger';

export class DepositToVaultDto {
    @ApiProperty()
    depositId: string;

    @ApiProperty()
    amount: string;

    @ApiProperty()
    user: string;

    @ApiProperty()
    vaultAddress: string;

    @ApiProperty({ type: Number })
    chainId: number;
}

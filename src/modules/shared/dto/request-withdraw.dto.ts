import { ApiProperty } from '@nestjs/swagger';

export class RequestWithdrawDto {
    @ApiProperty()
    requestId: string;

    @ApiProperty()
    vaultAddress: string;

    @ApiProperty()
    shareOwner: string;

    @ApiProperty()
    amount: string;
}

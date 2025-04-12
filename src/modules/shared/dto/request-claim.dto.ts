import { ApiProperty } from '@nestjs/swagger';

export class RequestClaimDto {
    @ApiProperty()
    requestId: string;

    @ApiProperty()
    vaultAddress: string;

    @ApiProperty()
    shareOwner: string;

    @ApiProperty()
    amount: string;
}

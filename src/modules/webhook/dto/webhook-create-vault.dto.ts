import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class WebhookCreateVaultDto {
    @ApiProperty()
    @IsNotEmpty()
    txHash: string;

    @ApiProperty()
    @IsNotEmpty()
    chainId: string;
}

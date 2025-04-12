import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class WebhookDepositDto {
    @ApiProperty()
    @IsNotEmpty()
    txHash: string;

    @ApiProperty()
    @IsNotEmpty()
    vault: string;
}

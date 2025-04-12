import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class VaultWithdrawSignatureDto {
    @ApiProperty({ type: String, example: '0x...', description: 'The signature of the withdraw' })
    @IsNotEmpty()
    signature: string;

    @ApiProperty({ type: Number, example: '123456', description: 'The deadline of the withdraw' })
    @IsNotEmpty()
    @IsNumber()
    deadline: number;
}

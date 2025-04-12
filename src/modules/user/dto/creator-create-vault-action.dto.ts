import { ApiProperty, ApiPropertyOptional, getSchemaPath } from '@nestjs/swagger';
import { IsEnum, IsIn, IsNotEmpty, IsNumberString, IsOptional, ValidateNested } from 'class-validator';
import {
    APEX_TRADING_PAIRS,
    APEX_TRADING_SIDE,
    APEX_TRADING_TRADE_TYPE,
    APEX_TRADING_TYPE,
} from '@app/modules/vault/vault.constants';
import { Type } from 'class-transformer';

export class ApexTradingPayloadDto {
    @ApiProperty({ type: String, example: APEX_TRADING_PAIRS[0] })
    @IsNotEmpty()
    @IsIn(APEX_TRADING_PAIRS, { message: 'Invalid trading pair' })
    pair: string;

    @ApiProperty({ type: String, example: 'BUY' })
    @IsNotEmpty()
    @IsIn(APEX_TRADING_SIDE, { message: 'Invalid trading side' })
    side: string;

    @ApiProperty({ type: String, example: '' })
    @IsNotEmpty()
    @IsIn(APEX_TRADING_TYPE, { message: 'Invalid trading type' })
    type: string;

    @ApiProperty({ type: String, example: APEX_TRADING_TRADE_TYPE.PERPETUAL, enum: APEX_TRADING_TRADE_TYPE })
    @IsNotEmpty()
    @IsEnum(APEX_TRADING_TRADE_TYPE, { message: 'Invalid trade type' })
    tradeType: APEX_TRADING_TRADE_TYPE;

    @ApiProperty({ type: String, example: '1' })
    @IsNotEmpty()
    @IsNumberString()
    price: string;
}

export class CreatorCreateVaultActionDto {
    @ApiProperty()
    @IsNotEmpty()
    command: string;

    @ApiPropertyOptional({
        oneOf: [{ $ref: getSchemaPath(ApexTradingPayloadDto) }],
    })
    @IsOptional()
    @Type(() => {
        return ApexTradingPayloadDto;
    })
    @ValidateNested()
    payload?: ApexTradingPayloadDto;
}

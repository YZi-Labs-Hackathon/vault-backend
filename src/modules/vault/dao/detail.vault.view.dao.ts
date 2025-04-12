import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Vault } from '@app/modules/vault/entities/vault.entity';

export class pnlDetail {
    @ApiProperty()
    @IsString()
    yourPNL: string;

    @ApiProperty()
    @IsString()
    pnl24h: string;
}

export class DetailVaultViewDao extends Vault {
    @ApiProperty({ description: 'total value locked', type: String })
    @IsString()
    totalLocked: string;

    @ApiProperty({ description: 'total user deposit in vault', type: String })
    @IsString()
    totalUserDeposits: string;

    @ApiProperty({ description: 'APR (Annual Percentage Rate)', type: String })
    @IsString()
    apr: string;

    @ApiProperty({ description: 'Your Deposit', type: String })
    @IsString()
    yourDeposit: string;

    @ApiProperty({ type: pnlDetail, description: 'Profit and Loss' })
    @IsString()
    pnl: pnlDetail;
}

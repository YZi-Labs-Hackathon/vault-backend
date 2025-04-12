import { User } from '@app/modules/user/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Vault } from '@app/modules/vault/entities/vault.entity';
import { VaultDepositor } from '@app/modules/vault/entities/vault-depositor.entity';

class pnlDetails {
    @ApiProperty({ description: 'total pnl number', type: String, example: '-2000' })
    pnl: string;

    @ApiProperty({ description: 'total pnl percent', type: String, example: '-10%' })
    pnlPercent: string;
}


export class DepositorHistory {

    @ApiProperty()
    user: User;

    @ApiProperty()
    vault: Vault

    @ApiProperty()
    info: VaultDepositor

    @ApiProperty()
    pnlAllTime:pnlDetails


}
import { ApiProperty } from '@nestjs/swagger';
import { Vault } from '@app/modules/vault/entities/vault.entity';
import { Chain } from '@app/modules/chain/entities/chain.entity';
import { Token } from '@app/modules/token/entities/token.entity';

export class VaultDao extends Vault{
    @ApiProperty()
    chain: Chain;

    @ApiProperty()
    token: Token;
}
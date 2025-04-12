import { ApiProperty } from '@nestjs/swagger';
import { Vault } from '@app/modules/vault/entities/vault.entity';
import { VaultTransaction } from '@app/modules/vault/entities/vault-transaction.entity';

export class HistoryTransactionDao extends VaultTransaction{
    @ApiProperty()
    vaultInfo: Vault;

}
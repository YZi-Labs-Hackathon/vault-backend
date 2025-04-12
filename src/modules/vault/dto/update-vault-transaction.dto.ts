import { PartialType } from '@nestjs/swagger';
import { CreateVaultTransactionDto } from '@app/modules/vault/dto/create-vault-transaction.dto';

export class UpdateVaultTransactionDto extends PartialType(CreateVaultTransactionDto) {}

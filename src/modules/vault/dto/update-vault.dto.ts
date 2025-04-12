import { PartialType } from '@nestjs/swagger';
import { CreateVaultDto } from '@app/modules/vault/dto/create-vault.dto';

export class UpdateVaultDto extends PartialType(CreateVaultDto) {}

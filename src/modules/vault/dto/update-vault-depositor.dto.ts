import { PartialType } from '@nestjs/swagger';
import { CreateVaultDepositorDto } from '@app/modules/vault/dto/create-vault-depositor.dto';

export class UpdateVaultDepositorDto extends PartialType(CreateVaultDepositorDto) {}

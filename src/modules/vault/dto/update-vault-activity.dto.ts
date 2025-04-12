import { PartialType } from '@nestjs/swagger';
import { CreateVaultActivityDto } from '@app/modules/vault/dto/create-vault-activity.dto';

export class UpdateVaultActivityDto extends PartialType(CreateVaultActivityDto) {}

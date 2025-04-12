import { OmitType } from '@nestjs/swagger';
import { FilterVaultDto } from '@app/modules/vault/dto/filter-vault.dto';

export class CreatorFilterVaultDto extends OmitType(FilterVaultDto, ['creatorId'] as const) {}

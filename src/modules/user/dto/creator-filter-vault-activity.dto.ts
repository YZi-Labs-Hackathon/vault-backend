import { OmitType, PartialType } from '@nestjs/swagger';
import { FilterVaultActivityDto } from '@app/modules/vault/dto';

export class CreatorFilterVaultActivityDto extends PartialType(
    OmitType(FilterVaultActivityDto, ['creatorId'] as const)
) {}

import { OmitType, PartialType } from '@nestjs/swagger';
import { FilterVaultTransactionDto } from '@app/modules/vault/dto';

export class CreatorFilterVaultTransactionDto extends PartialType(
    OmitType(FilterVaultTransactionDto, ['creatorId'] as const)
) {}

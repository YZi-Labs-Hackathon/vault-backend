import { OmitType, PartialType } from '@nestjs/swagger';
import { CreatorCreateVaultDto } from '@app/modules/user/dto/creator-create-vault.dto';

export class CreatorUpdateVaultDto extends PartialType(
    OmitType(CreatorCreateVaultDto, ['depositRule', 'name', 'symbol', 'tokenId', 'aiAgent', 'depositInit'])
) {}

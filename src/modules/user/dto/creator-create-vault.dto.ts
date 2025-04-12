import { OmitType } from '@nestjs/swagger';
import { CreateVaultDto } from '@app/modules/vault/dto';

export class CreatorCreateVaultDto extends OmitType(CreateVaultDto, [
    'creatorId',
    'contractAddress',
    'chainId',
] as const) {}

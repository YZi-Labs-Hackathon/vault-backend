import { PartialType } from '@nestjs/swagger';
import { CreateProtocolTokenDto } from '@app/modules/protocol/dto/create-protocol-token.dto';

export class UpdateProtocolTokenDto extends PartialType(CreateProtocolTokenDto) {}

import { CreateProtocolDto } from '@app/modules/protocol/dto/create-protocol.dto';
import { PartialType } from '@nestjs/swagger';

export class UpdateProtocolDto extends PartialType(CreateProtocolDto) {}

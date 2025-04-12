import { PartialType } from '@nestjs/swagger';
import { CreateProtocolActionDto } from '@app/modules/protocol/dto/create-protocol-action.dto';

export class UpdateProtocolActionDto extends PartialType(CreateProtocolActionDto) {}

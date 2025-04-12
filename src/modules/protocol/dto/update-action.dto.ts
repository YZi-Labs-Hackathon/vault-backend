import { PartialType } from '@nestjs/swagger';
import { CreateActionDto } from '@app/modules/protocol/dto/create-action.dto';

export class UpdateActionDto extends PartialType(CreateActionDto) {}

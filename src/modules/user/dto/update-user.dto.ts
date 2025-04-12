import { PartialType, PickType } from '@nestjs/swagger';
import { CreateUserDto } from '@app/modules/user/dto/create-user.dto';

export class UpdateUserDto extends PartialType(PickType(CreateUserDto, ['name', 'status'] as const)) {}

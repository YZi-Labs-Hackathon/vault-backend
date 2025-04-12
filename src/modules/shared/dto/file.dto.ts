import { ApiProperty } from '@nestjs/swagger';

export class FileDto {
  @ApiProperty()
  url: string;
}

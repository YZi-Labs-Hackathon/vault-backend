import { ApiProperty } from '@nestjs/swagger';

export class EditVaultDao{
    @ApiProperty({description: 'status edit vault' ,type: Boolean})
    status: boolean;

    @ApiProperty({description: 'message edit vault' , type: String})
    message: string;
}
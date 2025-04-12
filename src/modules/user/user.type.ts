import { USER_ROLE } from '@app/modules/user/user.constants';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export interface IUserVaultPayload {
    id: string;
    name: string;
    address: string;
    chainType: string;
    role: USER_ROLE;
}

export class ChainInfoData {
    @ApiProperty({ type: Number, description: 'The chain id of the chain' })
    chainId: number;

    @ApiProperty({ type: String, description: 'The chain type of the chain' })
    chainType: string;

    @ApiProperty({ type: [String], description: 'The rpc of the chain', isArray: true })
    rpc: string[];
}

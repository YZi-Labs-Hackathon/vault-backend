import { USER_ROLE } from '@app/modules/user/user.constants';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VaultSignatureData } from '@app/modules/vault/vault.types';

export interface IUserVaultPayload {
    id: string;
    name: string;
    address: string;
    chainType: string;
    role: USER_ROLE;
}

export class VaultApproveApexParams {
    @ApiProperty()
    assets: string;

    @ApiProperty()
    shareOwner: string;

    @ApiProperty()
    withdrawalId: string;

    @ApiProperty({ type: VaultSignatureData })
    signature: VaultSignatureData;
}

export class ChainInfoData {
    @ApiProperty({ type: Number, description: 'The chain id of the chain' })
    chainId: number;

    @ApiProperty({ type: String, description: 'The chain type of the chain' })
    chainType: string;

    @ApiProperty({ type: [String], description: 'The rpc of the chain', isArray: true })
    rpc: string[];
}

export class VaultApproveData {
    @ApiProperty()
    service: string;

    @ApiPropertyOptional({ type: ChainInfoData })
    chainInfo?: ChainInfoData;

    @ApiPropertyOptional({ type: String })
    @ApiPropertyOptional({ type: VaultApproveApexParams })
    params?: VaultApproveApexParams;
}

import { Chain, CommonResponse, TokenAddress } from '@app/common/common.dto';
import { Protocol } from '@app/modules/protocol/dto/protocol.dto';
import { User } from '@app/modules/user/dto/user.dto';
import { ApiProperty } from '@nestjs/swagger';

export class Vault {
    @ApiProperty({ type: String, example: 'venus-usdc-vault' })
    id: string;

    @ApiProperty({ type: String, example: 'Venus USDC Vault' })
    name: string;

    @ApiProperty({})
    creator: any;

    @ApiProperty({ type: TokenAddress })
    token: TokenAddress;

    @ApiProperty({ type: Chain })
    chain: Chain;

    @ApiProperty({ type: String, example: '0x1234567890123456789012345678901234567890' })
    poolAddress: string;

    @ApiProperty({ type: [Protocol] })
    protocols: Protocol[];

    @ApiProperty({ type: String, example: '1000000000000000000' })
    tvl: string;

    @ApiProperty({ type: Number, example: 17.2 })
    apy: number;

    @ApiProperty({ type: String, example: '1000000000000000000' })
    totalEarned: string;

    @ApiProperty({ type: Number, example: 100 })
    ageDays: number;
}

class VaultDetails extends Vault {
    @ApiProperty({ type: String, example: '1000000000000000000' })
    totalDeposits: string;

    @ApiProperty({ type: String, example: '1000000000000000000' })
    totalWithdrawals: string;

    @ApiProperty({ type: String, example: '1000000000000000000' })
    totalUsers: string;
}

export class VaultDetailsWithBalance extends VaultDetails {
    @ApiProperty({ type: String, example: '1000000000000000' })
    freeBalance: string;
}

export class VaultActivity {
    @ApiProperty({ type: String, example: 'deposit' })
    action: string;

    @ApiProperty({ type: String, example: '1000000000000000000' })
    amount: string;

    @ApiProperty({ type: Object })
    params: any;

    @ApiProperty({ type: User })
    actor: User;

    @ApiProperty({ type: String, example: '2021-01-01 12:00:00' })
    timestamp: string;
}

export class VaultDepositor {
    @ApiProperty({ type: User })
    user: User;

    @ApiProperty({ type: Boolean, example: false })
    isCreator: boolean;

    @ApiProperty({ type: String, example: '1000000000000000000' })
    deposited: string;

    @ApiProperty({ type: String, example: '1000000000' })
    allTimePNL: string;

    @ApiProperty({ type: String, example: '1000000000' })
    unrealizedPNL: string;

    @ApiProperty({ type: Number, example: 30 })
    days: number;
}

export class GetListVaultsResponse extends CommonResponse {
    @ApiProperty({ type: [Vault] })
    vaults: Vault[];

    @ApiProperty({ type: Number, example: 100 })
    totalVaults: number;
}

export class GetVaultDetailsResponse extends CommonResponse {
    @ApiProperty({ type: VaultDetails })
    vault: VaultDetails;
}

export class GetVaultActivitiesResponse extends CommonResponse {
    @ApiProperty({ type: [VaultActivity] })
    activities: VaultActivity[];
}

export class GetVaultDepositorsResponse extends CommonResponse {
    @ApiProperty({ type: [VaultDepositor] })
    depositors: VaultDepositor[];
}

export class StopVaultResponse extends CommonResponse {
    @ApiProperty({ type: String, example: 'Vault deleted successfully' })
    message: string;

    @ApiProperty({
        type: String,
        example: '5vykhvSABGiCjESzMHQC5oSzwReR3dk5Qu47jeLcZ6RiyJvPY6wuJeimoUqn5rU7gykxbukgrtVifgAevcYcx1Cd',
    })
    txHash: string;
}

export class SyncTransactionRequest {
    @ApiProperty({
        type: String,
        example: '5vykhvSABGiCjESzMHQC5oSzwReR3dk5Qu47jeLcZ6RiyJvPY6wuJeimoUqn5rU7gykxbukgrtVifgAevcYcx1Cd',
    })
    txHash: string;
}

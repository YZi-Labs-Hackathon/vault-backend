import { ApiProperty, ApiPropertyOptional, getSchemaPath } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ChainInfoData } from '@app/modules/user/user.type';
import { ChainType } from '@app/common/types';

export class VaultTVLAndPnlData {
    @ApiPropertyOptional({ type: Number, description: 'The total value locked' })
    tvl?: number;

    @ApiPropertyOptional({ type: Number, description: 'The profit and loss' })
    pnl?: number;
}

export class VaultParamDepositData {
    @ApiProperty({ type: String, description: 'The amount to deposit' })
    amount: string;

    @ApiProperty({ type: String, description: 'The user address' })
    userAddress: string;

    @ApiProperty({ type: String, description: 'The vault TVL' })
    vautlTvl: string;
}

export class VaultSignatureDepositData {
    @ApiProperty({ type: String, description: 'The deadline of the transaction' })
    deadline: string;

    @ApiProperty({ type: String, description: 'The signature of the deposit' })
    signature: string;
}

export class VaultDepositData {
    @ApiProperty({ type: VaultParamDepositData, description: 'The Param of deposit' })
    vaultParam: VaultParamDepositData;

    @ApiProperty({ type: VaultSignatureDepositData, description: 'The signature of the deposit' })
    signature?: VaultSignatureDepositData;
}

export class VaultSignatureData {
    @ApiProperty({ type: String, description: 'The signature' })
    signature: string;

    @ApiProperty({ type: String, description: 'The deadline of the transaction' })
    deadline: number;
}

export class VaultFeeSignatureData {
    @ApiPropertyOptional({ type: String, description: 'The fee type' })
    feeType: string;

    @ApiPropertyOptional({ type: String, description: 'The fee amount' })
    fee: string;

    @ApiPropertyOptional({ type: String, description: 'The fee receiver' })
    receiver: string;
}

export class vaultWithdrawApexParams {
    @ApiProperty({ type: String, description: 'The request ID' })
    requestId: string;

    @ApiProperty({ type: String, description: 'The receiver receive tokens' })
    receiver: string;

    @ApiProperty({ type: String, description: 'The intermediate wallet' })
    intermediateWallet: string;

    @ApiPropertyOptional({ description: 'The Fees', isArray: true, type: VaultFeeSignatureData })
    fees?: VaultFeeSignatureData[];

    @ApiProperty({ type: VaultSignatureData, description: 'The signature of the deposit' })
    signature?: VaultSignatureData;
}

export class vaultWithdrawVenusParams {
    @ApiPropertyOptional({ description: 'The Fees', isArray: true, type: VaultFeeSignatureData })
    fees?: VaultFeeSignatureData[];

    @ApiProperty({ type: VaultSignatureData, description: 'The signature of the deposit' })
    signature?: VaultSignatureData;
}

export class VaultWithdrawData {
    @ApiPropertyOptional({ type: ChainInfoData })
    chainInfo?: ChainInfoData;

    @ApiPropertyOptional({
        oneOf: [{ $ref: getSchemaPath(vaultWithdrawVenusParams) }, { $ref: getSchemaPath(vaultWithdrawApexParams) }],
    })
    params?: vaultWithdrawApexParams | vaultWithdrawVenusParams;

    @ApiPropertyOptional({ type: String, description: 'The service' })
    service?: string;
}

export class VaultWithDrawState {
    @ApiProperty({ type: String, description: 'The amount available to withdraw' })
    amount: number;

    @ApiPropertyOptional({ type: Number, description: 'The locked share' })
    lockedAmount: number;

    @ApiPropertyOptional({ type: Number, description: 'Time lock withdraw' })
    lockedWithdrawAt: number;
}

export class CreateVaultParams {
    @ApiProperty({ type: String, description: 'The authority address of the vault' })
    authority: string;

    @ApiProperty({ type: String, description: 'The protocol helper of the vault' })
    protocolHelper: string;

    @ApiProperty({ type: String, description: 'The name of the vault' })
    name: string;

    @ApiProperty({ type: String, description: 'The symbol of the vault' })
    symbol: string;

    @ApiProperty({ type: String, description: 'The underlying of the vault' })
    underlying: string;

    @ApiProperty({ type: String, description: 'The amount of initial deposit' })
    initialAgentDeposit: string;

    @ApiProperty({ type: String, description: 'he amount min deposit' })
    minDeposit: string;

    @ApiProperty({ type: String, description: 'The amount max deposit' })
    maxDeposit: string;
}

export class CreateVaultData {
    @ApiProperty({ type: VaultSignatureData, description: 'The signature create vault' })
    @IsNotEmpty()
    signature: VaultSignatureData;

    @ApiProperty({ type: CreateVaultParams, description: 'The params of the vault' })
    @IsNotEmpty()
    vaultParam: CreateVaultParams;

    @ApiProperty({ type: String, description: 'The vault ID' })
    @IsNotEmpty()
    vaultId: string;
}

export class UserVaultTransactionStatistic {
    @ApiProperty({ type: String })
    yourDeposit: string;

    @ApiProperty({ type: String })
    totalWithdraw: string;

    @ApiProperty({ type: String })
    withdrawable: string;
}

export class CheckVaultNameData {
    @ApiProperty({ type: Boolean })
    isExist: boolean;
}

export class UserWithdrawParams {
    @ApiProperty({ type: String, description: 'The withdraw ID' })
    @IsNotEmpty()
    withdrawId: string;

    @ApiProperty({ type: String, description: 'The user address' })
    @IsNotEmpty()
    user: string;

    @ApiProperty({ type: String, description: 'The amount out' })
    @IsNotEmpty()
    amountOut: string;

    @ApiProperty({ type: String, description: 'The vault TVL' })
    @IsNotEmpty()
    vaultTvl: string;

    @ApiProperty({ type: String, description: 'The vault fee' })
    @IsNotEmpty()
    vaultFee: string;

    @ApiProperty({ type: String, description: 'The creator fee' })
    @IsNotEmpty()
    creatorFee: string;
}

export class UserWithdrawData {
    @ApiProperty()
    @IsNotEmpty()
    service: string;

    @ApiPropertyOptional({ type: VaultSignatureData, description: 'The Signature withdraw' })
    @IsOptional()
    signature?: VaultSignatureData;

    @ApiPropertyOptional({ type: UserWithdrawParams, description: 'The params' })
    @IsOptional()
    payload?: UserWithdrawParams;
}

export class VaultActionData {
    @ApiProperty({ type: String, description: 'The chain type', enum: ChainType })
    @IsNotEmpty()
    @IsEnum(ChainType)
    chainType: ChainType;

    @ApiProperty({ type: String, description: 'The targets', isArray: true })
    @IsNotEmpty()
    @IsArray()
    @IsString({ each: true })
    targets: string[];

    @ApiProperty({ type: String, description: 'The data', isArray: true })
    @IsNotEmpty()
    @IsArray()
    @IsString({ each: true })
    data: string[];

    @ApiProperty({ type: String, description: 'The deadline' })
    @IsNotEmpty()
    deadline: string;

    @ApiProperty({ type: String, description: 'The signature' })
    @IsNotEmpty()
    signature: string;
}

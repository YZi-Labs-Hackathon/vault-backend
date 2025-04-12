import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, Unique } from 'typeorm';
import { BaseEntity } from '@app/modules/shared/common/base.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsArray,
    IsBoolean,
    IsNotEmpty,
    IsNumber,
    IsObject,
    IsOptional,
    IsString,
    IsUUID,
    Max,
    Min,
    ValidateIf,
    ValidateNested,
} from 'class-validator';
import { VAULT_STATUS } from '@app/modules/vault/vault.constants';
import { Chain } from '@app/modules/chain/entities/chain.entity';
import { Token } from '@app/modules/token/entities/token.entity';
import { VaultTransaction } from '@app/modules/vault/entities/vault-transaction.entity';
import { VaultAction } from '@app/modules/vault/entities/vault-action.entity';
import { VaultDepositor } from '@app/modules/vault/entities/vault-depositor.entity';
import { User } from '@app/modules/user/entities/user.entity';
import { CustomException, ERROR_CODE } from '@app/common/errors';
import { VaultProtocol } from '@app/modules/vault/entities/vault-protocol.entity';
import { VaultActivity } from '@app/modules/vault/entities/vault-activity.entity';
import { Transform, Type } from 'class-transformer';
import { Protocol } from '@app/modules/protocol/entities/protocol.entity';
import { parseUnits } from 'ethers';

export class VaultDepositPermitted {
    @ApiPropertyOptional({ type: [String], description: 'Whitelist wallets' })
    @IsOptional()
    @IsArray()
    whitelistWallets?: string[];

    @ApiPropertyOptional({ type: [String], description: 'Blacklist wallets' })
    @IsOptional()
    @IsArray()
    blacklistWallets?: string[];
}

export class VaultDepositRule {
    @ApiProperty({ type: Number, description: 'The minimum amount of deposit', default: 0 })
    @IsNotEmpty()
    @IsNumber()
    min: number;

    @ApiProperty({ type: Number, description: 'The maximum amount of deposit', default: 1000 })
    @IsNotEmpty()
    @IsNumber()
    @ValidateIf((o) => {
        console.log(`o.max: ${o.max}, o.min: ${o.min}`);
        if (o.max != 0 && o.max < o.min) {
            throw new CustomException(
                'Maximum deposit amount must be greater than minimum amount',
                ERROR_CODE.BAD_REQUEST
            );
        }
        return true;
    })
    max: number;

    @ApiPropertyOptional({ type: Boolean, description: 'Reject all deposits status', default: false })
    @IsOptional()
    @IsBoolean()
    rejectAllDeposits?: boolean;

    @ApiPropertyOptional({ type: VaultDepositPermitted, description: 'Deposit Permitted' })
    @IsOptional()
    @Type(() => VaultDepositPermitted)
    @ValidateNested()
    depositPermitted?: VaultDepositPermitted;
}

export class VaultWithdrawTerm {
    @ApiProperty({ type: Number, description: 'The lock-up period of withdraw' })
    @IsNotEmpty()
    lockUpPeriod: number;

    @ApiProperty({ type: Number, description: 'The delay period of withdraw' })
    @IsNotEmpty()
    delay: number;

    @ApiPropertyOptional({ type: Boolean, description: 'Multi-Sig Approval' })
    @IsOptional()
    @Transform((value) => {
        if (!value) {
            return false;
        }
        return value;
    })
    isMultiSig?: boolean;
}

export class initVaultDeposit {
    @ApiPropertyOptional({ type: String, description: 'Network deposit' })
    @IsOptional()
    @IsUUID('4')
    networkId?: string;

    @ApiProperty({ type: String, description: 'Amount deposit' })
    @IsNotEmpty()
    amountDeposit: string;

    @ApiPropertyOptional({ type: String, description: 'Max Capacity' })
    @IsOptional()
    maxCapacity?: string;
}

export class VaultFee {
    @ApiProperty({ type: Number, description: 'The fee of performance (in percentage)' })
    @IsNotEmpty()
    @Min(5)
    @Max(50)
    @IsNumber()
    performanceFee: number;

    @ApiPropertyOptional({ type: String, description: 'Recipient address of the fee' })
    @IsOptional()
    recipientAddress?: string;

    @ApiPropertyOptional({ type: Number, description: 'Exit Fee Rate' })
    @IsOptional()
    exitFee?: number;

    @ApiPropertyOptional({ description: 'Exit Fee allocated to' })
    @IsOptional()
    exitFeeLocate?: any;
}

export class VaultAIAgent {
    @ApiPropertyOptional({ type: String, description: 'AI Agent Name' })
    @IsOptional()
    @IsString()
    nameAI?: string;

    @ApiPropertyOptional({ type: String, description: 'description' })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ type: String, description: 'AI Agent API URL' })
    @IsOptional()
    @IsString()
    urlAIAgent?: string;

    @ApiPropertyOptional({ type: String, description: 'API Authentication types' })
    @IsOptional()
    @IsString()
    authenticationType?: string;

    @ApiPropertyOptional({ type: String, description: 'Authentication Key' })
    @IsOptional()
    @IsString()
    authenticationKey?: string;

    @ApiPropertyOptional({ type: Number, description: 'Connect Timeout' })
    @IsOptional()
    @IsNumber()
    connectTimeOut?: number;

    @ApiPropertyOptional({ type: Number, description: 'Retry Attempts' })
    @IsOptional()
    @IsNumber()
    retry?: number;
}

@Entity()
@Unique(['name', 'symbol'])
@Index(['status'])
@Index(['chainId'])
export class Vault extends BaseEntity {
    @Column('varchar', { length: 100 })
    @ApiProperty({ type: String, description: 'The name of the vault', maxLength: 100 })
    name: string;

    @Column('varchar', { nullable: true })
    @ApiPropertyOptional({ type: String, description: 'The logo of the vault' })
    logo?: string;

    @Column('text', { nullable: true })
    @ApiPropertyOptional({ type: String, description: 'The description of the vault' })
    description?: string;

    @Column('varchar', { nullable: false, length: 50 })
    @ApiProperty({ type: String, description: 'The symbol of the share token' })
    symbol: string;

    @Column('uuid')
    @ApiProperty({ type: String, description: 'The chain id of the vault', format: 'uuid' })
    chainId: string;

    @Column('uuid')
    @ApiProperty({ type: String, description: 'The token id of the vault', format: 'uuid' })
    tokenId: string;

    @Column('uuid')
    @ApiProperty({ type: String, description: 'The creator id of the vault', format: 'uuid' })
    creatorId: string;

    @Column('jsonb', { nullable: true })
    @ApiPropertyOptional({ type: VaultDepositRule, description: 'The deposit rule of the vault' })
    depositRule?: VaultDepositRule;

    @Column('jsonb', { nullable: true })
    @ApiPropertyOptional({ type: VaultWithdrawTerm, description: 'The withdraw term of the vault' })
    withdrawTerm?: VaultWithdrawTerm;

    @Column('jsonb', { nullable: true })
    @ApiPropertyOptional({ type: VaultFee, description: 'The fee of the vault' })
    fee?: VaultFee;

    @Column('jsonb', { nullable: true })
    @ApiPropertyOptional({ type: VaultAIAgent, description: 'The AI agent of the vault' })
    aiAgent?: VaultAIAgent;

    @Column('varchar', { nullable: true, length: 100 })
    @ApiPropertyOptional({ type: String, description: 'The contract address of the vault', maxLength: 100 })
    contractAddress?: string;

    @Column('varchar', { nullable: true, length: 100 })
    @ApiPropertyOptional({ type: String, description: 'The contract share token address of the vault', maxLength: 100 })
    shareTokenAddress?: string;

    @Column('numeric', { default: 0, nullable: true })
    @ApiPropertyOptional()
    score?: number;

    @Column('varchar', { nullable: true, length: 100, default: VAULT_STATUS.IN_REVIEW })
    @ApiPropertyOptional({ type: String, description: 'Status of the vault', maxLength: 100, enum: VAULT_STATUS })
    status?: string;

    @Column('jsonb', { nullable: true })
    @ApiPropertyOptional({ type: initVaultDeposit, description: 'deposit init vault' })
    depositInit: any;

    @Column('uuid', { nullable: true })
    @ApiPropertyOptional({ type: String, description: 'Default Protocol' })
    defaultProtocolId?: string;

    @ManyToOne(() => Protocol, (protocol) => protocol.vaults, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'default_protocol_id' })
    protocol: Protocol;

    @OneToMany(() => VaultAction, (vaultAction) => vaultAction.vault, { onDelete: 'CASCADE' })
    vaultActions: VaultAction[];

    @OneToMany(() => VaultProtocol, (vaultProtocol) => vaultProtocol.vault, { onDelete: 'CASCADE' })
    vaultProtocols: VaultProtocol[];

    @ManyToOne(() => User, (creator) => creator.vaults, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'creator_id' })
    @ApiProperty({ type: () => User, description: 'The creator of the vault' })
    creator: User;

    @ManyToOne(() => Chain, (chain) => chain.vaults, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'chain_id' })
    @ApiProperty({ type: () => Chain, description: 'The chain of the vault' })
    chain: Chain;

    @ManyToOne(() => Token, (token) => token.vaults, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'token_id' })
    @ApiProperty({ type: () => Token, description: 'The token of the vault' })
    token: Token;

    @OneToMany(() => VaultTransaction, (vaultTransaction) => vaultTransaction.vault, { onDelete: 'CASCADE' })
    transactions: VaultTransaction[];

    @OneToMany(() => VaultDepositor, (vaultDepositors) => vaultDepositors.vault, { onDelete: 'CASCADE' })
    depositors: VaultDepositor[];

    @OneToMany(() => VaultActivity, (activities) => activities.vault, { onDelete: 'CASCADE' })
    activities: VaultActivity[];

    public validDepositRule(amount: string, decimal: number = 6, userAddress: string): boolean {
        console.log(`Deposit rule: ${amount}`, this.depositRule);
        if (this.depositRule && BigInt(amount) < parseUnits(this.depositRule.min.toString(), +decimal)) {
            throw new CustomException('Deposit amount is less than min deposit amount', ERROR_CODE.BAD_REQUEST);
        } else if (
            this.depositRule &&
            this.depositRule.max != 0 &&
            BigInt(amount) > parseUnits(this.depositRule.max.toString(), +decimal)
        ) {
            throw new CustomException('Deposit amount is greater than max deposit amount', ERROR_CODE.BAD_REQUEST);
        }

        if (this.depositRule && this.depositRule.rejectAllDeposits === true) {
            throw new CustomException('Deposit is not permitted', ERROR_CODE.BAD_REQUEST);
        }

        if (this.depositRule && this.depositRule.depositPermitted) {
            if (
                this.depositRule.depositPermitted.whitelistWallets &&
                !this.depositRule.depositPermitted.whitelistWallets.includes(userAddress)
            ) {
                throw new CustomException('Deposit is not permitted', ERROR_CODE.BAD_REQUEST);
            } else if (
                this.depositRule.depositPermitted.blacklistWallets &&
                this.depositRule.depositPermitted.blacklistWallets.includes(userAddress)
            ) {
                throw new CustomException('Deposit is not permitted', ERROR_CODE.BAD_REQUEST);
            }
        }

        return true;
    }

    public toDetailTransaction(): any {
        return {
            id: this.id,
            name: this.name,
            symbol: this.symbol,
            logo: this.logo,
            description: this.description,
            token: this.token
                ? {
                      name: this.token.name,
                      symbol: this.token.symbol,
                      address: this.token.address,
                      logo: this.token.logo,
                      decimals: this.token.decimals,
                      protocol: this.token.protocol,
                  }
                : undefined,
        };
    }
}

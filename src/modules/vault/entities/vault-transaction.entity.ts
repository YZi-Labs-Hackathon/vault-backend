import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '@app/modules/shared/common/base.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VAULT_TRANSACTION_STATUS, VAULT_TRANSACTION_TYPE } from '@app/modules/vault/vault.constants';
import { Exclude, Type } from 'class-transformer';
import { User } from '@app/modules/user/entities/user.entity';
import { Vault } from '@app/modules/vault/entities/vault.entity';
import { IsNumber, IsOptional } from 'class-validator';
import { UserVaultTransactionStatistic } from '@app/modules/vault/vault.types';

export class VaultTransactionMetadata {
    @ApiPropertyOptional({ type: String, description: 'The PNL of the user' })
    pnl?: string;
}

export class VaultFees {
    fee?: string;
    feeType?: string;
    receiver?: string;
}

export class VaultWithdrawMetadata {
    @ApiPropertyOptional({ type: String, description: 'The Signature of request withdraw' })
    signature?: string;

    @ApiPropertyOptional({ type: Number, description: 'The Deadline of request withdraw' })
    @IsNumber()
    deadline?: number;
}

@Entity()
@Index(['userId'])
@Index(['status'])
@Index(['type'])
@Unique(['txHash'])
export class VaultTransaction extends BaseEntity {
    @Column('varchar', { length: 100, nullable: true })
    @ApiPropertyOptional({ type: String, description: 'txId' })
    txId?: string;

    @Column('uuid')
    @ApiProperty({ type: String, description: 'The user id' })
    userId: string;

    @Column('uuid')
    @ApiProperty({ type: String, description: 'The Vault id' })
    vaultId: string;

    @Column('varchar', { length: 100 })
    @ApiProperty({ type: String, description: 'The types of the flow', enum: VAULT_TRANSACTION_TYPE })
    type: string;

    @Column('varchar', { nullable: true })
    @ApiPropertyOptional({ type: String, description: 'The amount request deposit/withdraw' })
    amount?: string;

    @Column('varchar', { nullable: true })
    @ApiPropertyOptional({ type: String, description: 'The net amount' })
    netAmount?: string;

    @Column('varchar', { nullable: true, default: 0 })
    @Exclude()
    @ApiPropertyOptional({ type: String, description: 'The share calculated for the user' })
    share?: string;

    @Column('int', { nullable: true })
    @ApiProperty({ type: String, description: 'The deadline of the transaction' })
    deadline: number;

    @Column('varchar', { length: 255, nullable: true })
    @ApiPropertyOptional({ type: String, description: 'The hash of the transaction' })
    txHash?: string;

    @Column('varchar', { length: 100, default: VAULT_TRANSACTION_STATUS.PENDING })
    @ApiProperty({ type: String, description: 'The status of the flow', enum: VAULT_TRANSACTION_STATUS })
    status: string;

    @Column('jsonb', { nullable: true })
    @Exclude()
    @ApiPropertyOptional({ type: VaultTransactionMetadata, description: 'The metadata of the vault transaction' })
    metadata?: any;

    @Column('jsonb', { nullable: true })
    @Exclude()
    @ApiPropertyOptional({ type: VaultFees, description: 'The fees of the vault transaction', isArray: true })
    fees?: VaultFees[];

    @ManyToOne(() => Vault, (vault) => vault.transactions, { onDelete: 'CASCADE' })
    @ApiPropertyOptional({ type: () => Vault, description: 'The vault of the vault transaction' })
    @JoinColumn({ name: 'vault_id' })
    vault: Vault;

    @ManyToOne(() => User, (user) => user.vaultTransactions, { onDelete: 'CASCADE' })
    @ApiPropertyOptional({ type: () => User, description: 'The user of the vault transaction' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ApiPropertyOptional({ type: UserVaultTransactionStatistic })
    @IsOptional()
    @Type(() => UserVaultTransactionStatistic)
    userVaultStatistic?: UserVaultTransactionStatistic;
}

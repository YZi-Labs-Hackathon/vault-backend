import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '@app/modules/shared/common/base.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '@app/modules/user/entities/user.entity';
import { Vault } from '@app/modules/vault/entities/vault.entity';

@Entity()
@Unique(['vaultId', 'userId'])
@Index(['lockedWithdrawAt'])
export class VaultDepositor extends BaseEntity {
    @Column('uuid')
    @ApiProperty({ type: String, description: 'The Vault id' })
    vaultId: string;

    @Column('uuid')
    @ApiProperty({ type: String, description: 'The User id' })
    userId: string;

    @Column('varchar', { default: '0', nullable: true })
    @ApiProperty({ type: String, description: 'The share of the user' })
    share: string;

    @Column('varchar', { default: '0', nullable: true })
    @ApiProperty({ type: String, description: 'The amount deposit of the user' })
    amount: string;

    @Column('varchar', { default: '0', nullable: true })
    @ApiProperty({ type: String, description: 'The principal amount of the user' })
    principalAmount: string;

    @Column({ type: 'varchar', nullable: true })
    @ApiPropertyOptional({ type: String, description: 'The locked share' })
    lockedAmount: string;

    @Column({ type: 'int', nullable: true })
    @ApiPropertyOptional({ type: Number, description: 'Time lock withdraw' })
    lockedWithdrawAt: number;

    @ManyToOne(() => User, (user) => user.depositors, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Vault, (vault) => vault.depositors, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'vault_id' })
    vault: Vault;
}

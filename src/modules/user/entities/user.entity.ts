import { ChainType } from '@app/common/types';
import { Column, Entity, Index, OneToMany, Unique } from 'typeorm';
import { BaseEntity } from '@app/modules/shared/common/base.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { STATUS } from '@app/modules/shared/shared.constants';
import { VaultTransaction } from '@app/modules/vault/entities/vault-transaction.entity';
import { VaultDepositor } from '@app/modules/vault/entities/vault-depositor.entity';
import { USER_ROLE } from '@app/modules/user/user.constants';
import { Vault } from '@app/modules/vault/entities/vault.entity';
import { Exclude } from 'class-transformer';

@Entity({
    name: 'users',
})
@Index(['status'])
@Unique(['address', 'chainType'])
export class User extends BaseEntity {
    @Column('varchar', { length: 100, nullable: true })
    @ApiPropertyOptional()
    name?: string;

    @Column('varchar', { length: 255 })
    @ApiProperty()
    address: string;

    @Column('varchar', { length: 10 })
    @ApiProperty({ enum: ChainType })
    chainType: ChainType;

    @Column('int', { nullable: true, default: STATUS.ACTIVE })
    @Exclude()
    @ApiPropertyOptional({ type: Number, description: 'The status of the user', default: STATUS.ACTIVE })
    status?: number;

    @Column('varchar', { length: 100, default: USER_ROLE.USER })
    @ApiProperty({ enum: USER_ROLE })
    role: string;

    @OneToMany(() => VaultTransaction, (transaction) => transaction.user, { onDelete: 'CASCADE' })
    vaultTransactions: VaultTransaction[];

    @OneToMany(() => VaultDepositor, (depositor) => depositor.user, { onDelete: 'CASCADE' })
    depositors: VaultDepositor[];

    @OneToMany(() => Vault, (vault) => vault.creator, { onDelete: 'CASCADE' })
    vaults: Vault[];
}

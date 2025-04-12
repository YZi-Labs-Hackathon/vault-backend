import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '@app/modules/shared/common/base.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VAULT_ACTION_STATUS } from '@app/modules/vault/vault.constants';
import { Vault } from '@app/modules/vault/entities/vault.entity';
import { ProtocolAction } from '@app/modules/protocol/entities/protocol-action.entity';

export class VaultActionMetadata {}

@Entity()
@Index(['status'])
export class VaultAction extends BaseEntity {
    @Column('uuid')
    @ApiProperty({ type: String, description: 'The Vault id' })
    vaultId: string;

    @Column('uuid')
    @ApiProperty({ type: String, description: 'The protocols action Id' })
    protocolActionId: string;

    @Column('varchar', { length: 255 })
    @ApiProperty({ type: String, description: 'The amount own using vault for action' })
    amount: string;

    @Column('varchar', { length: 100 })
    @ApiProperty({ type: String, description: 'The rate share at the moment' })
    rateShare: string;

    @Column('varchar', { length: 100 })
    @ApiProperty({ type: String, description: 'Snapshot The total TVL at the moment' })
    totalTvl: string;

    @Column('jsonb', { nullable: true })
    @ApiPropertyOptional({ type: VaultActionMetadata, description: 'The metadata of the vault activity' })
    metadata?: VaultActionMetadata;

    @Column('varchar', { length: 100 })
    @ApiProperty({
        type: String,
        description: 'The status of the action',
        enum: VAULT_ACTION_STATUS,
        default: VAULT_ACTION_STATUS.PENDING,
    })
    status: string;

    @ManyToOne(() => ProtocolAction, (action) => action.vaultActions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'protocol_action_id' })
    protocolAction: ProtocolAction;

    @ManyToOne(() => Vault, (vault) => vault.vaultActions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'vault_id' })
    vault: Vault;
}

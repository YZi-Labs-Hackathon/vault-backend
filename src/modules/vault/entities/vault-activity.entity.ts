import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '@app/modules/shared/common/base.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { VAULT_ACTIVITY_STATUS, VAULT_ACTIVITY_TYPE } from '@app/modules/vault/vault.constants';
import { Vault } from '@app/modules/vault/entities/vault.entity';
import { PROTOCOL_SERVICE } from '@app/modules/protocol/protocol.type';

export class VaultActivityMetadata {}

@Entity()
@Index(['status'])
@Index(['type'])
@Unique(['txHash'])
export class VaultActivity extends BaseEntity {
    @Column('uuid')
    @ApiProperty({ type: String, description: 'The Vault id' })
    vaultId: string;

    @Column('varchar', { length: 100 })
    @ApiProperty({ type: String, description: 'The type of the vault activity', enum: VAULT_ACTIVITY_TYPE })
    type: string;

    @Column('varchar', { length: 100 })
    @ApiProperty({ type: String, description: 'The protocol of the vault activity', enum: PROTOCOL_SERVICE })
    protocol: string;

    @Column('jsonb', { nullable: true })
    @ApiPropertyOptional({ type: VaultActivityMetadata, description: 'The metadata of the vault activity' })
    metadata?: VaultActivityMetadata;

    @Column('varchar', { length: 100 })
    @ApiProperty({ type: String, description: 'The transaction hash of activity' })
    txHash: string;

    @Column('varchar', { length: 100 })
    @ApiProperty({
        type: String,
        description: 'The status of the activity',
        enum: VAULT_ACTIVITY_STATUS,
        default: VAULT_ACTIVITY_STATUS.PENDING,
    })
    status: string;

    @ManyToOne(() => Vault, (vault) => vault.activities, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'vault_id' })
    vault: Vault;
}

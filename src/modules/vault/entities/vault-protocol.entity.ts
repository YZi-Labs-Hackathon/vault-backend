import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { BaseEntity } from '@app/modules/shared/common/base.entity';
import { ApiProperty } from '@nestjs/swagger';
import { VAULT_PROTOCOL_STATUS } from '@app/modules/vault/vault.constants';
import { Vault } from '@app/modules/vault/entities/vault.entity';
import { Protocol } from '@app/modules/protocol/entities/protocol.entity';

@Entity()
@Unique(['vaultId', 'protocolId'])
@Index(['status'])
export class VaultProtocol extends BaseEntity {
    @Column('uuid')
    @ApiProperty({ type: String, description: 'The Vault id' })
    vaultId: string;

    @Column('uuid')
    @ApiProperty({ type: String, description: 'The protocol Id' })
    protocolId: string;

    @Column('varchar', { length: 100 })
    @ApiProperty({
        type: String,
        description: 'The status of vault protocol',
        enum: VAULT_PROTOCOL_STATUS,
        default: VAULT_PROTOCOL_STATUS.ACTIVE,
    })
    status: string;

    @ManyToOne(() => Protocol, (protocol) => protocol.vaultProtocols, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'protocol_id' })
    protocol: Protocol;

    @ManyToOne(() => Vault, (vault) => vault.vaultProtocols, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'vault_id' })
    vault: Vault;
}

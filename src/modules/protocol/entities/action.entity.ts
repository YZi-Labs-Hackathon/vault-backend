import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, Unique } from 'typeorm';
import { BaseEntity } from '@app/modules/shared/common/base.entity';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { STATUS } from '@app/modules/shared/shared.constants';
import { ProtocolAction } from '@app/modules/protocol/entities/protocol-action.entity';
import { ACTION_COMMAND } from '@app/modules/protocol/protocol.constants';

export class ActionMetadata {}

@Entity()
@Index(['name'])
@Index(['status'])
@Unique(['command'])
export class Action extends BaseEntity {
    @Column('varchar', { length: 100 })
    @ApiPropertyOptional({ type: String, description: 'The command of the action', enum: ACTION_COMMAND })
    command: string;

    @Column('varchar', { length: 255 })
    @ApiPropertyOptional({ type: String, description: 'The name of the protocols' })
    name?: string;

    @Column('jsonb', { nullable: true })
    @ApiPropertyOptional({ description: 'The metadata of the action', type: ActionMetadata })
    metadata?: ActionMetadata;

    @Column('int', { nullable: true, default: STATUS.ACTIVE })
    @ApiPropertyOptional({ type: Number, description: 'The status of the protocols', default: STATUS.ACTIVE })
    status?: number;

    @OneToMany(() => ProtocolAction, (protocolAction) => protocolAction.action, { onDelete: 'CASCADE' })
    protocolActions: ProtocolAction[];
}

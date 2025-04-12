import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '@app/modules/shared/common/base.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProtocolAction } from './protocol-action.entity';
import { STATUS } from '@app/modules/shared/shared.constants';
import { Action } from '@app/modules/protocol/entities/action.entity';
import { Expose } from 'class-transformer';
import { PROTOCOL_SERVICE } from '@app/modules/protocol/protocol.type';
import { ProtocolToken } from './protocol-token.entity';

@Entity()
@Index(['name'])
@Index(['status'])
export class Protocol extends BaseEntity {
    @Column('varchar', { length: 100 })
    @ApiProperty({ type: String, description: 'The service of the protocols', enum: PROTOCOL_SERVICE })
    service: string;

    @Column('varchar', { length: 255 })
    @ApiProperty({ type: String, description: 'The name of the protocols' })
    name?: string;

    @Column('varchar', { nullable: true })
    @ApiPropertyOptional({ type: String, description: 'The image of the protocols' })
    image?: string;

    @Column('text', { nullable: true })
    @ApiPropertyOptional({ type: String, description: 'The description of the protocols' })
    description?: string;

    @Column('varchar', { nullable: true, length: 100 })
    @ApiPropertyOptional({ type: String, description: 'The strategy address of the protocol' })
    strategy?: string;

    @Column('numeric', { nullable: true, default: 0 })
    @ApiPropertyOptional({ type: Number, description: 'The total TVL of the protocols' })
    totalTVL?: number;

    @Column('numeric', { nullable: true, default: 0 })
    @ApiPropertyOptional({ type: Number, description: 'The total earned of the protocols' })
    totalEarned?: number;

    @Column('numeric', { nullable: true, default: 0 })
    @ApiPropertyOptional({ type: Number, description: 'The total deposits of the protocols' })
    totalDeposits?: number;

    @Column('numeric', { nullable: true, default: 0 })
    @ApiPropertyOptional({ type: Number, description: 'The total withdrawals of the protocols' })
    totalWithdrawals?: number;

    @Column('numeric', { nullable: true, default: 0 })
    @ApiPropertyOptional({ type: Number, description: 'The total users of the protocols' })
    totalUsers?: number;

    @Column('text', { nullable: true, array: true })
    @ApiPropertyOptional({ type: [String], description: 'The supported chains of the vault' })
    supportedChainIds?: string[];

    @Column('text', { nullable: true, array: true })
    @ApiPropertyOptional({ type: [String], description: 'The tags of the protocols' })
    tags?: string[];

    @Column('int', { nullable: true, default: STATUS.ACTIVE })
    @ApiPropertyOptional({ type: Number, description: 'The status of the protocols', default: STATUS.ACTIVE })
    @Expose({ groups: ['operator'] })
    status?: number;

    @Column('jsonb', { nullable: true })
    @ApiPropertyOptional({ type: Object, description: 'The data of the protocols' })
    data?: any;

    @OneToMany(() => ProtocolAction, (protocolAction) => protocolAction.protocol, { onDelete: 'CASCADE' })
    protocolActions: ProtocolAction[];

    @ApiPropertyOptional({ type: () => Action, isArray: true, description: 'The actions of the protocols' })
    actions?: Action[];

    @OneToMany(() => ProtocolToken, (protocolToken) => protocolToken.protocol, { onDelete: 'CASCADE' })
    protocolTokens: ProtocolToken[];
}

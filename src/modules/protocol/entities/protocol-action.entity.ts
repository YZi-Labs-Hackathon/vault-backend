import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, Unique } from 'typeorm';
import { BaseEntity } from '@app/modules/shared/common/base.entity';
import { ApiProperty, ApiPropertyOptional, getSchemaPath } from '@nestjs/swagger';
import { STATUS } from '@app/modules/shared/shared.constants';
import { Protocol } from '@app/modules/protocol/entities/protocol.entity';
import { Action } from '@app/modules/protocol/entities/action.entity';
import { IsOptional } from 'class-validator';

export class VenusStakingMetadata {
    @ApiPropertyOptional({ type: String, description: 'The address of the Venus staking' })
    @IsOptional()
    abi?: any;

    @ApiPropertyOptional({ description: 'The support addresses of the Venus staking' })
    @IsOptional()
    allowedTokens?: {
        sourceAddress: string;
        targetAddress: string;
        chainId: number;
        symbol: string;
        decimals: number;
    }[];
}

export class VenusBorrowMetadata {
    @ApiPropertyOptional({ type: String, description: 'The address of the Venus borrow' })
    @IsOptional()
    abi?: string;

    @ApiPropertyOptional({ description: 'The support addresses of the Venus staking' })
    @IsOptional()
    allowedTokens?: {
        sourceAddress: string;
        targetAddress: string;
        chainId: number;
        symbol: string;
        decimals: number;
    }[];
}

@Entity()
@Index(['status'])
@Index(['isDefault'])
@Unique(['protocolId', 'actionId'])
export class ProtocolAction extends BaseEntity {
    @Column('uuid')
    @ApiProperty()
    protocolId: string;

    @Column('uuid')
    @ApiProperty()
    actionId: string;

    @Column('jsonb', { nullable: true })
    @ApiPropertyOptional({
        oneOf: [{ $ref: getSchemaPath(VenusStakingMetadata) }, { $ref: getSchemaPath(VenusBorrowMetadata) }],
        description: 'The metadata of the protocols action',
    })
    metadata?: VenusStakingMetadata | VenusBorrowMetadata;

    @Column('int', { nullable: true, default: STATUS.ACTIVE })
    @ApiPropertyOptional({ type: Number, description: 'The status of the protocols', default: STATUS.ACTIVE })
    status?: number;

    @Column('boolean', { default: false })
    @ApiPropertyOptional({ type: Boolean, description: 'The default action of the protocols' })
    isDefault?: boolean;

    @ManyToOne(() => Protocol, (protocol) => protocol.protocolActions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'protocol_id' })
    protocol: Protocol;

    @ManyToOne(() => Action, (action) => action.protocolActions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'action_id' })
    action: Action;
}

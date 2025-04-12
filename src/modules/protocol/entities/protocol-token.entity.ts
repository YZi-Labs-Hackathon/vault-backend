import { Column, Entity, Index, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { STATUS } from '@app/modules/shared/shared.constants';
import { Protocol } from '@app/modules/protocol/entities/protocol.entity';
import { Token } from '@app/modules/token/entities/token.entity';
import { BaseEntity } from '@app/modules/shared/common/base.entity';

@Entity()
@Unique(['protocolId', 'tokenId'])
export class ProtocolToken extends BaseEntity {
    @Column('uuid')
    @ApiProperty({ description: 'The protocol id' })
    protocolId: string;

    @Column('uuid')
    @ApiProperty({ description: 'The token id' })
    tokenId: string;

    @Column('int', { default: STATUS.ACTIVE })
    @ApiProperty({ description: 'The status of the token', default: STATUS.ACTIVE })
    status: number;

    @ManyToOne(() => Protocol, (protocol) => protocol.protocolTokens, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'protocol_id' })
    protocol: Protocol;

    @ManyToOne(() => Token, (token) => token.protocolTokens, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'token_id' })
    token: Token;
}

import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, Unique } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { BaseEntity } from '@app/modules/shared/common/base.entity';
import { PROTOCOL, STATUS } from '@app/modules/shared/shared.constants';
import { Chain } from '@app/modules/chain/entities/chain.entity';
import { ProtocolToken } from '@app/modules/protocol/entities/protocol-token.entity';

@Entity()
@Index(['name'])
@Index(['chainId'])
@Unique(['address', 'chainId'])
export class Token extends BaseEntity {
    @Column('varchar')
    @ApiProperty()
    name: string;

    @Column('varchar')
    @ApiProperty()
    symbol: string;

    @Column('varchar')
    @ApiProperty()
    address: string;

    @Column('text')
    @ApiProperty()
    logo: string;

    @Column('numeric')
    @ApiProperty({ type: Number })
    decimals: number;

    @Column('uuid')
    @ApiProperty({ type: String })
    chainId: string;

    @Column('varchar')
    @ApiProperty({ enum: PROTOCOL })
    protocol: string;

    @Expose({ groups: ['operator'] })
    @Column({ nullable: true, enum: STATUS, default: STATUS.ACTIVE })
    @ApiProperty()
    status?: number;

    @Column('varchar', { nullable: true })
    @ApiPropertyOptional()
    assetId?: string;

    @ManyToOne(() => Chain, (chain) => chain.tokens, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'chain_id' })
    @ApiProperty({ type: () => Chain, description: 'The chain of the token' })
    chain: Chain;

    @OneToMany(() => ProtocolToken, (protocolToken) => protocolToken.token, { onDelete: 'CASCADE' })
    protocolTokens: ProtocolToken[];
}

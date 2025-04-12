import { Column, Entity, Index, OneToMany } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Expose } from 'class-transformer';
import { BaseEntity } from '@app/modules/shared/common/base.entity';
import { NetworkType, STATUS } from '@app/modules/shared/shared.constants';
import { ChainType } from '@app/common/types';
import { Token } from '@app/modules/token/entities/token.entity';

export class NativeCurrency {
    @ApiProperty()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsNotEmpty()
    symbol: string;

    @ApiProperty()
    @IsNotEmpty()
    decimals: number;
}

export class NetworkExplorer {
    @ApiProperty()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsNotEmpty()
    url: string;
}

@Entity()
@Index(['chainId', 'chainType'], { unique: true })
@Index(['name'])
@Index(['status'])
export class Chain extends BaseEntity {
    @Column('int')
    @ApiProperty()
    chainId: number;

    @Column('varchar', { default: ChainType.EVM })
    @ApiProperty({ enum: ChainType, default: ChainType.EVM })
    chainType: string;

    @Column('varchar', { nullable: false, length: 100 })
    @ApiProperty()
    name: string;

    @Column('text', { nullable: true })
    @ApiPropertyOptional()
    description?: string;

    @Column('varchar', { nullable: true })
    @ApiPropertyOptional()
    shortName?: string;

    @Column('varchar', { nullable: true })
    @ApiPropertyOptional()
    logo?: string;

    @Column('text', { array: true, nullable: false })
    @ApiProperty()
    rpc?: string[];

    @Column('varchar', { nullable: false })
    @ApiProperty()
    tokenStandard: string;

    @Column('integer', { nullable: true })
    @ApiPropertyOptional()
    durableBlockConfirmations?: number;

    @Column('varchar', { length: 100, nullable: false })
    @ApiProperty({ enum: NetworkType })
    type: NetworkType;

    @Column('jsonb', { nullable: false })
    @ApiProperty()
    nativeCurrency: NativeCurrency;

    @Column('jsonb', { nullable: false })
    @ApiProperty()
    explorers: NetworkExplorer[];

    @Column('boolean', { nullable: true, default: true })
    @ApiPropertyOptional()
    defaultEnableNative?: boolean;

    @Column('boolean', { nullable: true, default: false })
    @ApiPropertyOptional()
    skipDefaultGasForNative?: boolean;

    @Expose({ groups: ['operator'] })
    @Column({ nullable: true, default: STATUS.ACTIVE })
    @ApiProperty()
    status?: number;

    @Column({ nullable: true, length: 100, type: 'varchar' })
    @ApiPropertyOptional()
    vaultFactoryAddress?: string;

    @OneToMany(() => Token, (token) => token.chain, { onDelete: 'CASCADE' })
    tokens: Token[];
}

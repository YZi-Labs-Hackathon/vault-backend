import { BaseEntity } from "@app/modules/shared/common/base.entity";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Column, Entity, Index, Unique } from "typeorm";

@Entity({
    name: 'user_auth',
})
@Index(['address', 'userId'])
@Unique(['refreshToken'])
export class UserAuth extends BaseEntity {
    @Column('varchar', { length: 255 })
    @ApiProperty()
    userId: string;

    @Column('varchar', { length: 255 })
    @ApiProperty()
    address: string;

    @Column('varchar', {nullable: false})
    @ApiProperty()
    refreshToken: string;

    @Column('varchar', {nullable: true})
    @ApiPropertyOptional()
    userAgent: string;
}
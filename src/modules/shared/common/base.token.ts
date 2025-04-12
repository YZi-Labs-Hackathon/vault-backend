import { Column } from 'typeorm';
import { BaseEntity } from './base.entity';

export abstract class BaseToken extends BaseEntity {
    @Column({ type: 'timestamptz' })
    expiresAt: Date;

    @Column({ type: 'boolean', default: false })
    revoked: boolean;

    @Column({ type: 'timestamptz', nullable: true })
    revokedAt: Date;

    public abstract toPayload(): any;
}

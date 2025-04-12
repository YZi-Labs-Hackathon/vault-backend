import { CreateDateColumn, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export abstract class BaseEntity {
    @ApiProperty({
        description: 'Unique identifier',
        example: 'f0b0c8c0-0b0c-4c0d-8c0e-0b0c8c0d8c0e',
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        description: 'Date of creation',
        example: '2021-01-01T00:00:00.000Z',
    })
    @CreateDateColumn({ type: 'timestamptz' })
    @Index()
    createdAt: Date;

    @Expose({ groups: ['console'] })
    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;
}

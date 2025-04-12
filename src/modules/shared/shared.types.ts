import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StatusResponse {
    @ApiProperty({
        description: 'Status of the request',
        example: true,
    })
    status: boolean;
}

export class SuccessResponse extends StatusResponse {
    @ApiProperty({
        description: 'Message of the request',
    })
    message: string;
}

export class PaginationMeta {
    @ApiProperty()
    itemCount: number;
    @ApiPropertyOptional()
    totalItems?: number;
    @ApiProperty()
    itemsPerPage: number;
    @ApiPropertyOptional()
    totalPages?: number;
    @ApiProperty()
    currentPage: number;
}

export class PaginationModel<T> {
    @ApiProperty({ isArray: true })
    items: T[];

    @ApiProperty({ type: PaginationMeta })
    meta: PaginationMeta;
}

export class VaultValidatorEVM {
    chainId: number;
    vault?: string;
    actions: any[];
}

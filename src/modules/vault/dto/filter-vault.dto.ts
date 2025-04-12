import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export enum FilterField {
    VAULT = 'VAULT',
    AGE = 'AGE',
}

export enum SortBy {
    DESC = 'DESC',
    ASC = 'ASC',
}

export class FilterVaultDto {
    @ApiPropertyOptional({ type: String, enum: FilterField, description: 'filter Filed', example: FilterField.VAULT })
    @IsOptional()
    @IsEnum(FilterField)
    sortField: FilterField;

    @ApiPropertyOptional({ type: String, enum: SortBy, description: 'filter Filed', example: SortBy.DESC })
    @IsOptional()
    @IsEnum(SortBy)
    sortBy: SortBy;

    @ApiPropertyOptional({ type: String, description: 'The name of the vault', maxLength: 100 })
    @IsOptional()
    name?: string;

    @ApiPropertyOptional({ type: String, description: 'vault id', maxLength: 100 })
    @IsOptional()
    @IsUUID('4')
    vaultId?: string;

    @ApiPropertyOptional({ type: String, description: 'The chain id of the vault' })
    @IsOptional({})
    @IsUUID('4')
    chainId?: string;

    @ApiPropertyOptional({ type: String, description: 'The token id of the vault', format: 'uuid' })
    @IsOptional({})
    @IsUUID('4')
    tokenId?: string;

    @ApiPropertyOptional({ type: String, description: 'The creator id of the vault', format: 'uuid' })
    @IsOptional({})
    @IsUUID('4')
    creatorId?: string;

    @ApiPropertyOptional({ type: String, description: 'The contract address of the vault' })
    @IsOptional({})
    contractAddress?: string;

    @ApiPropertyOptional({
        type: String,
        description: 'filter Status of the vault',
    })
    @IsOptional({})
    filterStatus: string;

    @ApiPropertyOptional({ type: String, description: 'The services of the vault' })
    @IsOptional({})
    services?: string;
}

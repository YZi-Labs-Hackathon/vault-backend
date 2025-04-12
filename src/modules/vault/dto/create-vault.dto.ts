import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import {
    initVaultDeposit,
    VaultAIAgent,
    VaultDepositRule,
    VaultFee,
    VaultWithdrawTerm,
} from '@app/modules/vault/entities/vault.entity';

export class CreateVaultDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ type: String, description: 'The name of the vault', maxLength: 100 })
    @MaxLength(100)
    name: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ type: String, description: 'The symbol of the share token', maxLength: 100 })
    @MaxLength(100)
    symbol: string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional({ type: String, description: 'The logo of the vault' })
    logo?: string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional({ type: String, description: 'The description of the vault' })
    description?: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ type: String, description: 'The chain id of the vault', format: 'uuid' })
    chainId?: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ type: String, description: 'The token id of the vault', format: 'uuid' })
    tokenId: string;

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ type: String, description: 'The creator id of the vault', format: 'uuid' })
    creatorId: string;

    @IsOptional()
    @ApiPropertyOptional({ type: VaultDepositRule, description: 'The deposit rule of the vault' })
    @Type(() => VaultDepositRule)
    @ValidateNested()
    depositRule?: VaultDepositRule;

    @IsNotEmpty()
    @ApiProperty({ type: VaultWithdrawTerm, description: 'The withdraw term of the vault' })
    @Type(() => VaultWithdrawTerm)
    @ValidateNested()
    withdrawTerm?: VaultWithdrawTerm;

    @IsNotEmpty()
    @ApiProperty({ type: VaultFee, description: 'The fee of the vault' })
    @Type(() => VaultFee)
    @ValidateNested()
    fee: VaultFee;

    @IsOptional()
    @ApiPropertyOptional({ type: VaultAIAgent, description: 'The AI agent of the vault' })
    @Type(() => VaultAIAgent)
    @ValidateNested()
    aiAgent?: VaultAIAgent;

    @IsString()
    // @IsOptional()
    // @ApiPropertyOptional({ type: String, description: 'The contract address of the vault', maxLength: 100 })
    contractAddress?: string;

    @IsOptional()
    @ApiPropertyOptional({ type: initVaultDeposit, description: 'Status of the vault', maxLength: 100 })
    @Type(() => initVaultDeposit)
    @ValidateNested()
    depositInit?: initVaultDeposit;

    @ApiProperty({ type: String, description: 'Default Protocol' })
    @IsNotEmpty()
    @IsUUID('4')
    defaultProtocolId: string;

    @ApiPropertyOptional({ description: 'The protocol id of the vault', format: 'uuid', isArray: true })
    @IsUUID('4', { each: true })
    @IsOptional()
    protocolIds: string[];
}

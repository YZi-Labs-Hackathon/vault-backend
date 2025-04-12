import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';


export enum FilterChart{
    Daily = 'Daily',
    Weekly = 'Weekly',
    Monthly = 'Monthly',
    Hourly = 'Hourly',

}


export class FilterVaultPntDto {
    @ApiProperty()
    @IsOptional()
    @IsEnum(FilterChart)
    timeRange: FilterChart
}
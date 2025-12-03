import { IsString, IsNotEmpty, MaxLength, IsObject, IsOptional } from 'class-validator';

export class CreateChartDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(200, { message: 'Chart title must not exceed 200 characters' })
    title: string;

    @IsObject()
    @IsNotEmpty()
    data: any; // JSON data for the chart
}

export class UpdateChartDto {
    @IsString()
    @IsOptional()
    @MaxLength(200, { message: 'Chart title must not exceed 200 characters' })
    title?: string;

    @IsObject()
    @IsOptional()
    data?: any; // JSON data for the chart
}

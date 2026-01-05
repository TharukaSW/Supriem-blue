import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateProductionDayDto {
    @ApiProperty({ example: '2024-01-15', description: 'Production date' })
    @IsString()
    productionDate: string;

    @ApiProperty({ example: '1', description: 'Finished product item ID' })
    @IsString()
    finishedProductId: string;

    @ApiProperty({ example: 100, description: 'Quantity produced' })
    @IsNumber()
    quantity: number;

    @ApiPropertyOptional({ example: 5, description: 'Scrap quantity' })
    @IsOptional()
    @IsNumber()
    scrapQuantity?: number;

    @ApiPropertyOptional({ description: 'Production notes' })
    @IsOptional()
    @IsString()
    notes?: string;
}

export class UpdateProductionDayDto {
    @ApiPropertyOptional({ example: 100, description: 'Quantity produced' })
    @IsOptional()
    @IsNumber()
    quantity?: number;

    @ApiPropertyOptional({ example: 5, description: 'Scrap quantity' })
    @IsOptional()
    @IsNumber()
    scrapQuantity?: number;

    @ApiPropertyOptional({ description: 'Production notes' })
    @IsOptional()
    @IsString()
    notes?: string;
}

export class ProductionQueryDto {
    @ApiPropertyOptional({ description: 'Page number' })
    @IsOptional()
    page?: number;

    @ApiPropertyOptional({ description: 'Items per page' })
    @IsOptional()
    limit?: number;

    @ApiPropertyOptional({ description: 'Search by product name' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ description: 'From date filter' })
    @IsOptional()
    @IsString()
    fromDate?: string;

    @ApiPropertyOptional({ description: 'To date filter' })
    @IsOptional()
    @IsString()
    toDate?: string;
}

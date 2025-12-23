import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductionLineDto {
    @ApiProperty({ example: '1' })
    @IsString()
    itemId: string;

    @ApiProperty({ example: 100 })
    @IsNumber()
    qtyProduced: number;

    @ApiPropertyOptional({ example: 5 })
    @IsOptional()
    @IsNumber()
    scrapQty?: number;
}

export class CreateProductionDayDto {
    @ApiProperty({ example: '2024-01-15' })
    @IsString()
    productionDate: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiProperty({ type: [ProductionLineDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ProductionLineDto)
    lines: ProductionLineDto[];
}

export class UpdateProductionDayDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    notes?: string;
}

export class ProductionQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    page?: number;

    @ApiPropertyOptional()
    @IsOptional()
    limit?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    fromDate?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    toDate?: string;
}

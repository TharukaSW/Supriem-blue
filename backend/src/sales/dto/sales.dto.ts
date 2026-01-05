import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { DocStatus } from '@prisma/client';

export class SalesOrderLineDto {
    @ApiProperty({ example: '1' })
    @IsString()
    itemId: string;

    @ApiProperty({ example: 50 })
    @IsNumber()
    qty: number;

    @ApiPropertyOptional({ example: 35.00 })
    @IsOptional()
    @IsNumber()
    unitPrice?: number;
}

export class CreateSalesOrderDto {
    @ApiProperty({ example: '1' })
    @IsString()
    customerId: string;

    @ApiPropertyOptional({ example: '2024-01-15' })
    @IsOptional()
    @IsString()
    orderDate?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiPropertyOptional({ example: 0 })
    @IsOptional()
    @IsNumber()
    discount?: number;

    @ApiPropertyOptional({ example: 0 })
    @IsOptional()
    @IsNumber()
    tax?: number;

    @ApiProperty({ type: [SalesOrderLineDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => SalesOrderLineDto)
    lines: SalesOrderLineDto[];
}

export class UpdateSalesOrderDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    discount?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    tax?: number;
}

export class SalesQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    page?: number;

    @ApiPropertyOptional()
    @IsOptional()
    limit?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ enum: DocStatus })
    @IsOptional()
    status?: DocStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    customerId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    fromDate?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    toDate?: string;
}

export class CreateDispatchDto {
    @ApiProperty({ example: '1' })
    @IsString()
    salesOrderId: string;

    @ApiPropertyOptional({ example: 'CAR-1234' })
    @IsOptional()
    @IsString()
    vehicleNo?: string;

    @ApiPropertyOptional({ example: 'John Driver' })
    @IsOptional()
    @IsString()
    driverName?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    remarks?: string;
}

export class UpdateDispatchDto {
    @ApiPropertyOptional({ example: 'CAR-1234' })
    @IsOptional()
    @IsString()
    vehicleNo?: string;

    @ApiPropertyOptional({ example: 'John Driver' })
    @IsOptional()
    @IsString()
    driverName?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    remarks?: string;
}

export class DispatchQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    page?: number;

    @ApiPropertyOptional()
    @IsOptional()
    limit?: number;

    @ApiPropertyOptional({ enum: DocStatus })
    @IsOptional()
    status?: DocStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    fromDate?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    toDate?: string;
}

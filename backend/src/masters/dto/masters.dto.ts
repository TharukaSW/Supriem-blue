import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsInt, IsEnum, IsNumber, IsDateString, Min, IsNotEmpty } from 'class-validator';
import { ItemType } from '@prisma/client';

// Units
export class CreateUnitDto {
    @ApiProperty({ example: 'Liters' })
    @IsString()
    unitName: string;

    @ApiPropertyOptional({ example: 'L' })
    @IsOptional()
    @IsString()
    symbol?: string;
}

export class UpdateUnitDto {
    @ApiPropertyOptional({ example: 'Liters' })
    @IsOptional()
    @IsString()
    unitName?: string;

    @ApiPropertyOptional({ example: 'L' })
    @IsOptional()
    @IsString()
    symbol?: string;
}

// Categories
export class CreateCategoryDto {
    @ApiProperty({ example: 'Raw Materials' })
    @IsString()
    categoryName: string;
}

export class UpdateCategoryDto {
    @ApiPropertyOptional({ example: 'Raw Materials' })
    @IsOptional()
    @IsString()
    categoryName?: string;
}

// Items
export class CreateItemDto {
    @ApiProperty({ example: 'ITEM001' })
    @IsString()
    itemCode: string;

    @ApiProperty({ example: 'Water Bottle 500ml' })
    @IsString()
    itemName: string;

    @ApiProperty({ enum: ItemType, example: 'PRODUCT' })
    @IsEnum(ItemType)
    itemType: ItemType;

    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @IsInt()
    categoryId?: number;

    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @IsInt()
    unitId?: number;
}

export class UpdateItemDto {
    @ApiPropertyOptional({ example: 'Water Bottle 500ml' })
    @IsOptional()
    @IsString()
    itemName?: string;

    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @IsInt()
    categoryId?: number;

    @ApiPropertyOptional({ example: 1 })
    @IsOptional()
    @IsInt()
    unitId?: number;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class ItemQueryDto {
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

    @ApiPropertyOptional({ enum: ItemType })
    @IsOptional()
    itemType?: ItemType;

    @ApiPropertyOptional()
    @IsOptional()
    categoryId?: number;

    @ApiPropertyOptional()
    @IsOptional()
    isActive?: boolean;
}

// Suppliers
export class CreateSupplierDto {
    @ApiProperty({ example: 'SUP001' })
    @IsString()
    supplierCode: string;

    @ApiProperty({ example: 'ABC Plastics Pvt Ltd' })
    @IsString()
    supplierName: string;

    @ApiPropertyOptional({ example: 'John Smith' })
    @IsOptional()
    @IsString()
    contactName?: string;

    @ApiPropertyOptional({ example: '+94771234567' })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({ example: 'supplier@example.com' })
    @IsOptional()
    @IsString()
    email?: string;

    @ApiPropertyOptional({ example: '123 Industrial Zone, Colombo' })
    @IsOptional()
    @IsString()
    address?: string;
}

export class UpdateSupplierDto {
    @ApiPropertyOptional({ example: 'ABC Plastics Pvt Ltd' })
    @IsOptional()
    @IsString()
    supplierName?: string;

    @ApiPropertyOptional({ example: 'John Smith' })
    @IsOptional()
    @IsString()
    contactName?: string;

    @ApiPropertyOptional({ example: '+94771234567' })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({ example: 'supplier@example.com' })
    @IsOptional()
    @IsString()
    email?: string;

    @ApiPropertyOptional({ example: '123 Industrial Zone, Colombo' })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class SupplierQueryDto {
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

    @ApiPropertyOptional()
    @IsOptional()
    isActive?: boolean;

    @ApiPropertyOptional({ description: 'Include price lists' })
    @IsOptional()
    @IsBoolean()
    includePrices?: boolean;
}

export class DeactivateSupplierDto {
    @ApiPropertyOptional({ example: 'No longer in business' })
    @IsOptional()
    @IsString()
    reason?: string;
}

// Customers
export class CreateCustomerDto {
    @ApiProperty({ example: 'CUS001' })
    @IsString()
    customerCode: string;

    @ApiProperty({ example: 'XYZ Supermarket' })
    @IsString()
    customerName: string;

    @ApiPropertyOptional({ example: 'Jane Doe' })
    @IsOptional()
    @IsString()
    contactName?: string;

    @ApiPropertyOptional({ example: '+94771234567' })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({ example: 'customer@example.com' })
    @IsOptional()
    @IsString()
    email?: string;

    @ApiPropertyOptional({ example: '456 High Street, Kandy' })
    @IsOptional()
    @IsString()
    address?: string;
}

export class UpdateCustomerDto {
    @ApiPropertyOptional({ example: 'XYZ Supermarket' })
    @IsOptional()
    @IsString()
    customerName?: string;

    @ApiPropertyOptional({ example: 'Jane Doe' })
    @IsOptional()
    @IsString()
    contactName?: string;

    @ApiPropertyOptional({ example: '+94771234567' })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({ example: 'customer@example.com' })
    @IsOptional()
    @IsString()
    email?: string;

    @ApiPropertyOptional({ example: '456 High Street, Kandy' })
    @IsOptional()
    @IsString()
    address?: string;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class CustomerQueryDto {
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

    @ApiPropertyOptional()
    @IsOptional()
    isActive?: boolean;

    @ApiPropertyOptional({ description: 'Include price lists' })
    @IsOptional()
    @IsBoolean()
    includePrices?: boolean;
}

export class DeactivateCustomerDto {
    @ApiPropertyOptional({ example: 'Closed permanently' })
    @IsOptional()
    @IsString()
    reason?: string;
}

// Supplier Item Prices
export class CreateSupplierItemPriceDto {
    @ApiProperty({ example: '1' })
    @IsNotEmpty()
    @IsString()
    itemId: string;

    @ApiProperty({ example: 25.50, description: 'Unit price must be greater than 0' })
    @IsNumber()
    @Min(0.01)
    unitPrice: number;

    @ApiPropertyOptional({ example: '2024-01-01', description: 'Effective start date (YYYY-MM-DD)' })
    @IsOptional()
    @IsDateString()
    effectiveFrom?: string;

    @ApiPropertyOptional({ example: '2024-12-31', description: 'End date (YYYY-MM-DD)' })
    @IsOptional()
    @IsDateString()
    endDate?: string;
}

export class UpdateSupplierItemPriceDto {
    @ApiPropertyOptional({ example: 25.50 })
    @IsOptional()
    @IsNumber()
    @Min(0.01)
    unitPrice?: number;

    @ApiPropertyOptional({ example: '2024-12-31' })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class SupplierPriceQueryDto {
    @ApiPropertyOptional({ description: 'Filter by item ID' })
    @IsOptional()
    @IsString()
    itemId?: string;

    @ApiPropertyOptional({ description: 'Show only active prices', default: false })
    @IsOptional()
    @IsBoolean()
    activeOnly?: boolean;

    @ApiPropertyOptional({ description: 'As of date for price retrieval (YYYY-MM-DD)' })
    @IsOptional()
    @IsDateString()
    asOfDate?: string;
}

export class DeactivateSupplierPriceDto {
    @ApiPropertyOptional({ example: '2024-12-31', description: 'End date to set (YYYY-MM-DD)' })
    @IsOptional()
    @IsDateString()
    endDate?: string;
}

// Customer Item Prices
export class CreateCustomerItemPriceDto {
    @ApiProperty({ example: '1' })
    @IsNotEmpty()
    @IsString()
    itemId: string;

    @ApiProperty({ example: 35.00, description: 'Unit price must be greater than 0' })
    @IsNumber()
    @Min(0.01)
    unitPrice: number;

    @ApiPropertyOptional({ example: '2024-01-01', description: 'Effective start date (YYYY-MM-DD)' })
    @IsOptional()
    @IsDateString()
    effectiveFrom?: string;

    @ApiPropertyOptional({ example: '2024-12-31', description: 'End date (YYYY-MM-DD)' })
    @IsOptional()
    @IsDateString()
    endDate?: string;
}

export class UpdateCustomerItemPriceDto {
    @ApiPropertyOptional({ example: 35.00 })
    @IsOptional()
    @IsNumber()
    @Min(0.01)
    unitPrice?: number;

    @ApiPropertyOptional({ example: '2024-12-31' })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class CustomerPriceQueryDto {
    @ApiPropertyOptional({ description: 'Filter by item ID' })
    @IsOptional()
    @IsString()
    itemId?: string;

    @ApiPropertyOptional({ description: 'Show only active prices', default: false })
    @IsOptional()
    @IsBoolean()
    activeOnly?: boolean;

    @ApiPropertyOptional({ description: 'As of date for price retrieval (YYYY-MM-DD)' })
    @IsOptional()
    @IsDateString()
    asOfDate?: string;
}

export class DeactivateCustomerPriceDto {
    @ApiPropertyOptional({ example: '2024-12-31', description: 'End date to set (YYYY-MM-DD)' })
    @IsOptional()
    @IsDateString()
    endDate?: string;
}

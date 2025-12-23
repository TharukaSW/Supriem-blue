import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsInt, IsEnum, IsNumber } from 'class-validator';
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
}

// Supplier Item Prices
export class CreateSupplierItemPriceDto {
    @ApiProperty({ example: '1' })
    @IsString()
    supplierId: string;

    @ApiProperty({ example: '1' })
    @IsString()
    itemId: string;

    @ApiProperty({ example: 25.50 })
    @IsNumber()
    unitPrice: number;

    @ApiPropertyOptional({ example: '2024-01-01' })
    @IsOptional()
    @IsString()
    effectiveFrom?: string;
}

export class UpdateSupplierItemPriceDto {
    @ApiPropertyOptional({ example: 25.50 })
    @IsOptional()
    @IsNumber()
    unitPrice?: number;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

// Customer Item Prices
export class CreateCustomerItemPriceDto {
    @ApiProperty({ example: '1' })
    @IsString()
    customerId: string;

    @ApiProperty({ example: '1' })
    @IsString()
    itemId: string;

    @ApiProperty({ example: 35.00 })
    @IsNumber()
    unitPrice: number;

    @ApiPropertyOptional({ example: '2024-01-01' })
    @IsOptional()
    @IsString()
    effectiveFrom?: string;
}

export class UpdateCustomerItemPriceDto {
    @ApiPropertyOptional({ example: 35.00 })
    @IsOptional()
    @IsNumber()
    unitPrice?: number;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

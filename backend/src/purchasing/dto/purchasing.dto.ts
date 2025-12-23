import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsArray, ValidateNested, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { DocStatus } from '@prisma/client';

export class PurchaseOrderLineDto {
    @ApiProperty({ example: '1' })
    @IsString()
    itemId: string;

    @ApiProperty({ example: 100 })
    @IsNumber()
    qty: number;

    @ApiPropertyOptional({ example: 25.50 })
    @IsOptional()
    @IsNumber()
    unitPrice?: number;
}

export class CreatePurchaseOrderDto {
    @ApiProperty({ example: '1' })
    @IsString()
    supplierId: string;

    @ApiPropertyOptional({ example: '2024-01-15' })
    @IsOptional()
    @IsString()
    purchaseDate?: string;

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

    @ApiProperty({ type: [PurchaseOrderLineDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PurchaseOrderLineDto)
    lines: PurchaseOrderLineDto[];
}

export class UpdatePurchaseOrderDto {
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

export class ConfirmPurchaseOrderDto {
    @ApiPropertyOptional({ example: 'VINV-001', description: 'Vendor invoice number' })
    @IsOptional()
    @IsString()
    vendorInvoiceNo?: string;

    @ApiPropertyOptional({ example: '2024-01-15', description: 'Vendor invoice date' })
    @IsOptional()
    @IsString()
    vendorInvoiceDate?: string;

    @ApiPropertyOptional({ example: 5000.00, description: 'Vendor invoice total' })
    @IsOptional()
    @IsNumber()
    vendorInvoiceTotal?: number;
}

export class PurchaseQueryDto {
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
    supplierId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    fromDate?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    toDate?: string;
}

import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreatePurchaseOrderLineDto } from './create-purchase-order-line.dto';

export class CreatePurchaseOrderDto {
  @ApiProperty({ description: 'Supplier ID', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  supplierId: number;

  @ApiPropertyOptional({ description: 'Purchase date (ISO format)', example: '2025-12-24' })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional({ description: 'Notes', example: 'Urgent order for production' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Discount amount', example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;

  @ApiPropertyOptional({ description: 'Tax amount', example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  tax?: number;

  @ApiProperty({ description: 'Purchase order lines', type: [CreatePurchaseOrderLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseOrderLineDto)
  lines: CreatePurchaseOrderLineDto[];
}

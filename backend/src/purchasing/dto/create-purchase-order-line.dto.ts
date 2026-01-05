import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePurchaseOrderLineDto {
  @ApiProperty({ description: 'Item ID (must be RAW type)', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  itemId: number;

  @ApiProperty({ description: 'Quantity', example: 100 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.001)
  qty: number;

  @ApiProperty({ description: 'Unit price', example: 12.50 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  unitPrice: number;

  @ApiPropertyOptional({ description: 'Price source: SUPPLIER_PRICE or MANUAL_OVERRIDE', example: 'SUPPLIER_PRICE' })
  @IsOptional()
  @IsString()
  priceSource?: string;

  @ApiPropertyOptional({ description: 'Override reason (required if MANUAL_OVERRIDE)', example: 'Negotiated discount' })
  @IsOptional()
  @IsString()
  overrideReason?: string;
}

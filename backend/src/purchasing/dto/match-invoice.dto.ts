import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MatchInvoiceDto {
  @ApiProperty({ description: 'Vendor invoice number', example: 'VINV-2025-001' })
  @IsNotEmpty()
  @IsString()
  vendorInvoiceNo: string;

  @ApiProperty({ description: 'Vendor invoice total amount', example: 1250.00 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  vendorInvoiceTotal: number;

  @ApiPropertyOptional({ description: 'Vendor invoice date (ISO format)', example: '2025-12-24' })
  @IsOptional()
  @IsDateString()
  vendorInvoiceDate?: string;
}

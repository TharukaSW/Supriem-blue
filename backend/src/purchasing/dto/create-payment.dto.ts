import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ description: 'Payment amount', example: 500.00 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiPropertyOptional({ description: 'Payment date (ISO format)', example: '2025-12-24' })
  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @ApiPropertyOptional({ description: 'Payment method: CASH, BANK, CHEQUE, OTHER', example: 'BANK' })
  @IsOptional()
  @IsString()
  method?: string;

  @ApiPropertyOptional({ description: 'Reference number (cheque no, transaction no, etc)', example: 'CHQ-123456' })
  @IsOptional()
  @IsString()
  referenceNo?: string;

  @ApiPropertyOptional({ description: 'Additional notes', example: 'Partial payment' })
  @IsOptional()
  @IsString()
  notes?: string;
}

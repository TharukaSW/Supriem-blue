import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CancelPurchaseOrderDto {
  @ApiPropertyOptional({ description: 'Reason for cancellation', example: 'Supplier cannot deliver' })
  @IsOptional()
  @IsString()
  cancelReason?: string;
}

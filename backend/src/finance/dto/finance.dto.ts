import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { PayMethod, TxType } from '@prisma/client';

// Expenses
export class CreateExpenseDto {
    @ApiPropertyOptional({ example: '2024-01-15' })
    @IsOptional()
    @IsString()
    expenseDate?: string;

    @ApiProperty({ example: 'Electricity' })
    @IsString()
    category: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ example: 5000 })
    @IsNumber()
    amount: number;

    @ApiPropertyOptional({ enum: PayMethod })
    @IsOptional()
    @IsEnum(PayMethod)
    method?: PayMethod;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    paidTo?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    supplierId?: string;
}

export class UpdateExpenseDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    category?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    amount?: number;

    @ApiPropertyOptional({ enum: PayMethod })
    @IsOptional()
    @IsEnum(PayMethod)
    method?: PayMethod;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    paidTo?: string;
}

export class ExpenseQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    page?: number;

    @ApiPropertyOptional()
    @IsOptional()
    limit?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    category?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    fromDate?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    toDate?: string;
}

// Payments
export class CreatePaymentDto {
    @ApiProperty({ example: '1' })
    @IsString()
    invoiceId: string;

    @ApiPropertyOptional({ example: '2024-01-15' })
    @IsOptional()
    @IsString()
    paymentDate?: string;

    @ApiProperty({ example: 5000 })
    @IsNumber()
    amount: number;

    @ApiPropertyOptional({ enum: PayMethod })
    @IsOptional()
    @IsEnum(PayMethod)
    method?: PayMethod;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    referenceNo?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    notes?: string;
}

export class PaymentQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    page?: number;

    @ApiPropertyOptional()
    @IsOptional()
    limit?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    invoiceId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    fromDate?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    toDate?: string;
}

export class TransactionQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    page?: number;

    @ApiPropertyOptional()
    @IsOptional()
    limit?: number;

    @ApiPropertyOptional({ enum: TxType })
    @IsOptional()
    txType?: TxType;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    fromDate?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    toDate?: string;
}

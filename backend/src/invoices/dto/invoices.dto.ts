import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { InvoiceType, DocStatus, MatchStatus } from '@prisma/client';

export class InvoiceQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    page?: number;

    @ApiPropertyOptional()
    @IsOptional()
    limit?: number;

    @ApiPropertyOptional({ enum: InvoiceType })
    @IsOptional()
    invoiceType?: InvoiceType;

    @ApiPropertyOptional({ enum: DocStatus })
    @IsOptional()
    status?: DocStatus;

    @ApiPropertyOptional({ enum: MatchStatus })
    @IsOptional()
    matchStatus?: MatchStatus;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    customerId?: string;

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

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    search?: string;
}

export class UpdateInvoiceMatchDto {
    @ApiProperty({ example: 'VINV-001' })
    @IsString()
    vendorInvoiceNo: string;

    @ApiPropertyOptional({ example: '2024-01-15' })
    @IsOptional()
    @IsString()
    vendorInvoiceDate?: string;

    @ApiProperty({ example: 5000 })
    vendorInvoiceTotal: number;
}

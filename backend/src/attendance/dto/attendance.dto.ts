import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsBoolean, IsEnum } from 'class-validator';
import { PayMethod } from '@prisma/client';

// Attendance
export class AttendanceInOutDto {
    @ApiProperty({ example: 'SBL001', description: 'User code or user ID' })
    @IsString()
    userIdentifier: string;
}

export class UpdateManualOtDto {
    @ApiProperty({ example: 2.5, description: 'Manual OT hours' })
    @IsNumber()
    manualOtHours: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    remarks?: string;
}

export class AttendanceQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    page?: number;

    @ApiPropertyOptional()
    @IsOptional()
    limit?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    userId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    fromDate?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    toDate?: string;
}

// Salary Ranges
export class CreateSalaryRangeDto {
    @ApiProperty({ example: 'Junior Staff' })
    @IsString()
    rangeName: string;

    @ApiProperty({ example: 30000 })
    @IsNumber()
    minSalary: number;

    @ApiProperty({ example: 50000 })
    @IsNumber()
    maxSalary: number;
}

export class UpdateSalaryRangeDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    rangeName?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    minSalary?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    maxSalary?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

// Employee Profile
export class UpdateEmployeeProfileDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    nic?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    address?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    joinedDate?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    designation?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    basicSalary?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    salaryRangeId?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber()
    otRate?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    notes?: string;
}

// Salary Payments
export class CreateSalaryPaymentDto {
    @ApiProperty({ example: '1' })
    @IsString()
    salaryRecordId: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    payDate?: string;

    @ApiProperty({ example: 50000 })
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
}

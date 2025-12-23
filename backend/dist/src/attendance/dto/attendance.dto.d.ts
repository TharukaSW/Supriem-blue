import { PayMethod } from '@prisma/client';
export declare class AttendanceInOutDto {
    userIdentifier: string;
}
export declare class UpdateManualOtDto {
    manualOtHours: number;
    remarks?: string;
}
export declare class AttendanceQueryDto {
    page?: number;
    limit?: number;
    userId?: string;
    fromDate?: string;
    toDate?: string;
}
export declare class CreateSalaryRangeDto {
    rangeName: string;
    minSalary: number;
    maxSalary: number;
}
export declare class UpdateSalaryRangeDto {
    rangeName?: string;
    minSalary?: number;
    maxSalary?: number;
    isActive?: boolean;
}
export declare class UpdateEmployeeProfileDto {
    nic?: string;
    address?: string;
    joinedDate?: string;
    designation?: string;
    basicSalary?: number;
    salaryRangeId?: string;
    otRate?: number;
    notes?: string;
}
export declare class CreateSalaryPaymentDto {
    salaryRecordId: string;
    payDate?: string;
    amount: number;
    method?: PayMethod;
    referenceNo?: string;
}

import { PrismaService } from '../prisma/prisma.service';
import { AttendanceInOutDto, UpdateManualOtDto, AttendanceQueryDto, CreateSalaryRangeDto, UpdateSalaryRangeDto, UpdateEmployeeProfileDto, CreateSalaryPaymentDto } from './dto';
export declare class AttendanceService {
    private prisma;
    constructor(prisma: PrismaService);
    clockIn(dto: AttendanceInOutDto, recordedBy: string): Promise<any>;
    clockOut(dto: AttendanceInOutDto, recordedBy: string): Promise<any>;
    updateManualOt(attendanceId: bigint, dto: UpdateManualOtDto): Promise<any>;
    findAllAttendance(query: AttendanceQueryDto): Promise<{
        data: any[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    searchEmployees(query: string): Promise<{
        userId: string;
        userCode: string;
        fullName: string;
    }[]>;
    createSalaryRange(dto: CreateSalaryRangeDto): Promise<{
        isActive: boolean;
        createdAt: Date;
        salaryRangeId: bigint;
        rangeName: string;
        minSalary: import("@prisma/client/runtime/library").Decimal;
        maxSalary: import("@prisma/client/runtime/library").Decimal;
    }>;
    findAllSalaryRanges(): Promise<{
        salaryRangeId: string;
        isActive: boolean;
        createdAt: Date;
        rangeName: string;
        minSalary: import("@prisma/client/runtime/library").Decimal;
        maxSalary: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    updateSalaryRange(id: bigint, dto: UpdateSalaryRangeDto): Promise<{
        salaryRangeId: string;
        isActive: boolean;
        createdAt: Date;
        rangeName: string;
        minSalary: import("@prisma/client/runtime/library").Decimal;
        maxSalary: import("@prisma/client/runtime/library").Decimal;
    }>;
    getEmployeeProfile(userId: bigint): Promise<{
        userId: string;
        employeeProfile: {
            userId: string;
            salaryRangeId: string | undefined;
            salaryRange: {
                isActive: boolean;
                createdAt: Date;
                salaryRangeId: bigint;
                rangeName: string;
                minSalary: import("@prisma/client/runtime/library").Decimal;
                maxSalary: import("@prisma/client/runtime/library").Decimal;
            } | null;
            nic: string | null;
            address: string | null;
            joinedDate: Date | null;
            designation: string | null;
            basicSalary: import("@prisma/client/runtime/library").Decimal;
            otRate: import("@prisma/client/runtime/library").Decimal;
            notes: string | null;
        } | null;
        monthlyAttendance: {
            totalDays: number;
            totalHours: number;
            totalOtHours: number;
        };
        role: {
            roleId: number;
            roleName: import(".prisma/client").$Enums.RoleName;
            idPrefix: string;
            description: string | null;
        };
        roleId: number;
        userCode: string;
        username: string | null;
        fullName: string;
        email: string | null;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateEmployeeProfile(userId: bigint, dto: UpdateEmployeeProfileDto): Promise<{
        userId: string;
        salaryRangeId: string | undefined;
        salaryRange: {
            isActive: boolean;
            createdAt: Date;
            salaryRangeId: bigint;
            rangeName: string;
            minSalary: import("@prisma/client/runtime/library").Decimal;
            maxSalary: import("@prisma/client/runtime/library").Decimal;
        } | null;
        nic: string | null;
        address: string | null;
        joinedDate: Date | null;
        designation: string | null;
        basicSalary: import("@prisma/client/runtime/library").Decimal;
        otRate: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
    }>;
    createSalaryPayment(dto: CreateSalaryPaymentDto, paidBy: string): Promise<{
        salaryPaymentId: string;
        salaryRecordId: string;
        paidBy: string | undefined;
        salaryRecord: {
            user: {
                roleId: number;
                userId: bigint;
                userCode: string;
                username: string | null;
                fullName: string;
                email: string | null;
                phone: string | null;
                passwordHash: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            userId: bigint;
            status: string;
            salaryRecordId: bigint;
            periodId: bigint;
            baseSalary: import("@prisma/client/runtime/library").Decimal;
            otHours: import("@prisma/client/runtime/library").Decimal;
            otAmount: import("@prisma/client/runtime/library").Decimal;
            allowances: import("@prisma/client/runtime/library").Decimal;
            deductions: import("@prisma/client/runtime/library").Decimal;
            totalPay: import("@prisma/client/runtime/library").Decimal;
        };
        createdAt: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        method: import(".prisma/client").$Enums.PayMethod;
        referenceNo: string | null;
        payDate: Date;
    }>;
    private findUserByIdentifier;
    private transformAttendance;
}

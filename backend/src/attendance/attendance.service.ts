import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
    AttendanceInOutDto, UpdateManualOtDto, AttendanceQueryDto,
    CreateSalaryRangeDto, UpdateSalaryRangeDto, UpdateEmployeeProfileDto,
    CreateSalaryPaymentDto,
} from './dto';
import { DateTime } from 'luxon';
import { PayMethod, TxType } from '@prisma/client';

@Injectable()
export class AttendanceService {
    constructor(private prisma: PrismaService) { }

    // ========== ATTENDANCE IN/OUT ==========
    async clockIn(dto: AttendanceInOutDto, recordedBy: string) {
        const user = await this.findUserByIdentifier(dto.userIdentifier);
        const now = DateTime.now().setZone('Asia/Colombo');
        const workDate = now.startOf('day').toJSDate();

        // Check if already clocked in today
        let attendance = await this.prisma.attendanceDaily.findUnique({
            where: { userId_workDate: { userId: user.userId, workDate } },
        });

        if (attendance && attendance.timeIn) {
            throw new BadRequestException('Already clocked in today');
        }

        if (attendance) {
            attendance = await this.prisma.attendanceDaily.update({
                where: { attendanceId: attendance.attendanceId },
                data: { timeIn: now.toJSDate(), recordedBy: BigInt(recordedBy) },
                include: { user: true },
            });
        } else {
            attendance = await this.prisma.attendanceDaily.create({
                data: {
                    userId: user.userId,
                    workDate,
                    timeIn: now.toJSDate(),
                    recordedBy: BigInt(recordedBy),
                },
                include: { user: true },
            });
        }

        return this.transformAttendance(attendance);
    }

    async clockOut(dto: AttendanceInOutDto, recordedBy: string) {
        const user = await this.findUserByIdentifier(dto.userIdentifier);
        const now = DateTime.now().setZone('Asia/Colombo');
        const workDate = now.startOf('day').toJSDate();

        const attendance = await this.prisma.attendanceDaily.findUnique({
            where: { userId_workDate: { userId: user.userId, workDate } },
        });

        if (!attendance || !attendance.timeIn) {
            throw new BadRequestException('Must clock in first');
        }

        if (attendance.timeOut) {
            throw new BadRequestException('Already clocked out today');
        }

        const timeIn = DateTime.fromJSDate(attendance.timeIn);
        const timeOut = now;
        const diffHours = timeOut.diff(timeIn, 'hours').hours;
        const systemHours = Math.max(0, Math.round(diffHours * 100) / 100);
        const systemOtHours = Math.max(0, systemHours - 8);

        const updated = await this.prisma.attendanceDaily.update({
            where: { attendanceId: attendance.attendanceId },
            data: {
                timeOut: now.toJSDate(),
                systemHours,
                systemOtHours,
                recordedBy: BigInt(recordedBy),
            },
            include: { user: true },
        });

        return this.transformAttendance(updated);
    }

    async updateManualOt(attendanceId: bigint, dto: UpdateManualOtDto) {
        const attendance = await this.prisma.attendanceDaily.findUnique({
            where: { attendanceId },
        });
        if (!attendance) throw new NotFoundException('Attendance record not found');

        const updated = await this.prisma.attendanceDaily.update({
            where: { attendanceId },
            data: { manualOtHours: dto.manualOtHours, remarks: dto.remarks },
            include: { user: true },
        });

        return this.transformAttendance(updated);
    }

    async findAllAttendance(query: AttendanceQueryDto) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (query.userId) where.userId = BigInt(query.userId);
        if (query.fromDate) where.workDate = { ...where.workDate, gte: new Date(query.fromDate) };
        if (query.toDate) where.workDate = { ...where.workDate, lte: new Date(query.toDate) };

        const [records, total] = await Promise.all([
            this.prisma.attendanceDaily.findMany({
                where, skip, take: limit,
                include: { user: true, recorder: true },
                orderBy: { workDate: 'desc' },
            }),
            this.prisma.attendanceDaily.count({ where }),
        ]);

        return {
            data: records.map(r => this.transformAttendance(r)),
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }

    async searchEmployees(query: string) {
        const users = await this.prisma.user.findMany({
            where: {
                OR: [
                    { userCode: { contains: query, mode: 'insensitive' } },
                    { fullName: { contains: query, mode: 'insensitive' } },
                ],
                isActive: true,
            },
            take: 10,
            select: { userId: true, userCode: true, fullName: true },
        });

        return users.map(u => ({
            ...u,
            userId: u.userId.toString(),
        }));
    }

    // ========== SALARY RANGES ==========
    async createSalaryRange(dto: CreateSalaryRangeDto) {
        return this.prisma.salaryRange.create({ data: dto });
    }

    async findAllSalaryRanges() {
        const ranges = await this.prisma.salaryRange.findMany({
            where: { isActive: true },
            orderBy: { minSalary: 'asc' },
        });
        return ranges.map(r => ({ ...r, salaryRangeId: r.salaryRangeId.toString() }));
    }

    async updateSalaryRange(id: bigint, dto: UpdateSalaryRangeDto) {
        const range = await this.prisma.salaryRange.update({
            where: { salaryRangeId: id },
            data: dto,
        });
        return { ...range, salaryRangeId: range.salaryRangeId.toString() };
    }

    // ========== EMPLOYEE PROFILE ==========
    async getEmployeeProfile(userId: bigint) {
        const user = await this.prisma.user.findUnique({
            where: { userId },
            include: {
                role: true,
                employeeProfile: { include: { salaryRange: true } },
            },
        });
        if (!user) throw new NotFoundException('User not found');

        // Get attendance summary for current month
        const now = DateTime.now().setZone('Asia/Colombo');
        const startOfMonth = now.startOf('month').toJSDate();
        const endOfMonth = now.endOf('month').toJSDate();

        const attendance = await this.prisma.attendanceDaily.findMany({
            where: {
                userId,
                workDate: { gte: startOfMonth, lte: endOfMonth },
            },
        });

        const totalDays = attendance.length;
        const totalHours = attendance.reduce((sum, a) => sum + Number(a.systemHours), 0);
        const totalOtHours = attendance.reduce((sum, a) => sum + Number(a.manualOtHours || a.systemOtHours), 0);

        const { passwordHash, ...userWithoutPassword } = user;
        return {
            ...userWithoutPassword,
            userId: user.userId.toString(),
            employeeProfile: user.employeeProfile ? {
                ...user.employeeProfile,
                userId: user.employeeProfile.userId.toString(),
                salaryRangeId: user.employeeProfile.salaryRangeId?.toString(),
            } : null,
            monthlyAttendance: { totalDays, totalHours, totalOtHours },
        };
    }

    async updateEmployeeProfile(userId: bigint, dto: UpdateEmployeeProfileDto) {
        const profile = await this.prisma.employeeProfile.upsert({
            where: { userId },
            update: {
                nic: dto.nic,
                address: dto.address,
                joinedDate: dto.joinedDate ? new Date(dto.joinedDate) : undefined,
                designation: dto.designation,
                basicSalary: dto.basicSalary,
                salaryRangeId: dto.salaryRangeId ? BigInt(dto.salaryRangeId) : undefined,
                otRate: dto.otRate,
                notes: dto.notes,
            },
            create: {
                userId,
                nic: dto.nic,
                address: dto.address,
                joinedDate: dto.joinedDate ? new Date(dto.joinedDate) : undefined,
                designation: dto.designation,
                basicSalary: dto.basicSalary || 0,
                salaryRangeId: dto.salaryRangeId ? BigInt(dto.salaryRangeId) : undefined,
                otRate: dto.otRate || 0,
                notes: dto.notes,
            },
            include: { salaryRange: true },
        });

        return {
            ...profile,
            userId: profile.userId.toString(),
            salaryRangeId: profile.salaryRangeId?.toString(),
        };
    }

    // ========== SALARY PAYMENTS ==========
    async createSalaryPayment(dto: CreateSalaryPaymentDto, paidBy: string) {
        const payment = await this.prisma.salaryPayment.create({
            data: {
                salaryRecordId: BigInt(dto.salaryRecordId),
                payDate: dto.payDate ? new Date(dto.payDate) : new Date(),
                amount: dto.amount,
                method: dto.method || PayMethod.CASH,
                referenceNo: dto.referenceNo,
                paidBy: BigInt(paidBy),
            },
            include: { salaryRecord: { include: { user: true } } },
        });

        // Create cash transaction for salary expense
        await this.prisma.cashTransaction.create({
            data: {
                txType: TxType.EXPENSE,
                sourceModule: 'SALARY',
                refTable: 'salary_payments',
                refId: payment.salaryPaymentId,
                amountIn: 0,
                amountOut: dto.amount,
                method: dto.method || PayMethod.CASH,
                note: `Salary payment for ${payment.salaryRecord.user.fullName}`,
                createdBy: BigInt(paidBy),
            },
        });

        return {
            ...payment,
            salaryPaymentId: payment.salaryPaymentId.toString(),
            salaryRecordId: payment.salaryRecordId.toString(),
            paidBy: payment.paidBy?.toString(),
        };
    }

    private async findUserByIdentifier(identifier: string) {
        // Try by user code first
        let user = await this.prisma.user.findUnique({ where: { userCode: identifier } });

        // Try by user ID
        if (!user && !isNaN(Number(identifier))) {
            user = await this.prisma.user.findUnique({ where: { userId: BigInt(identifier) } });
        }

        if (!user) throw new NotFoundException('User not found');
        if (!user.isActive) throw new BadRequestException('User is not active');
        return user;
    }

    private transformAttendance(attendance: any) {
        return {
            ...attendance,
            attendanceId: attendance.attendanceId.toString(),
            userId: attendance.userId.toString(),
            recordedBy: attendance.recordedBy?.toString(),
            user: attendance.user ? {
                userId: attendance.user.userId.toString(),
                userCode: attendance.user.userCode,
                fullName: attendance.user.fullName,
            } : undefined,
        };
    }
}

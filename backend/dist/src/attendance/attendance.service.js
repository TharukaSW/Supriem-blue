"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const luxon_1 = require("luxon");
const client_1 = require("@prisma/client");
let AttendanceService = class AttendanceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async clockIn(dto, recordedBy) {
        const user = await this.findUserByIdentifier(dto.userIdentifier);
        const now = luxon_1.DateTime.now().setZone('Asia/Colombo');
        const workDate = now.startOf('day').toJSDate();
        let attendance = await this.prisma.attendanceDaily.findUnique({
            where: { userId_workDate: { userId: user.userId, workDate } },
        });
        if (attendance && attendance.timeIn) {
            throw new common_1.BadRequestException('Already clocked in today');
        }
        if (attendance) {
            attendance = await this.prisma.attendanceDaily.update({
                where: { attendanceId: attendance.attendanceId },
                data: { timeIn: now.toJSDate(), recordedBy: BigInt(recordedBy) },
                include: { user: true },
            });
        }
        else {
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
    async clockOut(dto, recordedBy) {
        const user = await this.findUserByIdentifier(dto.userIdentifier);
        const now = luxon_1.DateTime.now().setZone('Asia/Colombo');
        const workDate = now.startOf('day').toJSDate();
        const attendance = await this.prisma.attendanceDaily.findUnique({
            where: { userId_workDate: { userId: user.userId, workDate } },
        });
        if (!attendance || !attendance.timeIn) {
            throw new common_1.BadRequestException('Must clock in first');
        }
        if (attendance.timeOut) {
            throw new common_1.BadRequestException('Already clocked out today');
        }
        const timeIn = luxon_1.DateTime.fromJSDate(attendance.timeIn);
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
    async updateManualOt(attendanceId, dto) {
        const attendance = await this.prisma.attendanceDaily.findUnique({
            where: { attendanceId },
        });
        if (!attendance)
            throw new common_1.NotFoundException('Attendance record not found');
        const updated = await this.prisma.attendanceDaily.update({
            where: { attendanceId },
            data: { manualOtHours: dto.manualOtHours, remarks: dto.remarks },
            include: { user: true },
        });
        return this.transformAttendance(updated);
    }
    async findAllAttendance(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (query.userId)
            where.userId = BigInt(query.userId);
        if (query.fromDate) {
            const date = luxon_1.DateTime.fromISO(query.fromDate, { zone: 'Asia/Colombo' }).startOf('day').toJSDate();
            where.workDate = { ...where.workDate, gte: date };
        }
        if (query.toDate) {
            const date = luxon_1.DateTime.fromISO(query.toDate, { zone: 'Asia/Colombo' }).endOf('day').toJSDate();
            where.workDate = { ...where.workDate, lte: date };
        }
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
    async searchEmployees(query) {
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
    async createSalaryRange(dto) {
        return this.prisma.salaryRange.create({ data: dto });
    }
    async findAllSalaryRanges() {
        const ranges = await this.prisma.salaryRange.findMany({
            where: { isActive: true },
            orderBy: { minSalary: 'asc' },
        });
        return ranges.map(r => ({ ...r, salaryRangeId: r.salaryRangeId.toString() }));
    }
    async updateSalaryRange(id, dto) {
        const range = await this.prisma.salaryRange.update({
            where: { salaryRangeId: id },
            data: dto,
        });
        return { ...range, salaryRangeId: range.salaryRangeId.toString() };
    }
    async getEmployeeProfile(userId) {
        const user = await this.prisma.user.findUnique({
            where: { userId },
            include: {
                role: true,
                employeeProfile: { include: { salaryRange: true } },
            },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const now = luxon_1.DateTime.now().setZone('Asia/Colombo');
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
    async updateEmployeeProfile(userId, dto) {
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
    async createSalaryPayment(dto, paidBy) {
        const payment = await this.prisma.salaryPayment.create({
            data: {
                salaryRecordId: BigInt(dto.salaryRecordId),
                payDate: dto.payDate ? new Date(dto.payDate) : new Date(),
                amount: dto.amount,
                method: dto.method || client_1.PayMethod.CASH,
                referenceNo: dto.referenceNo,
                paidBy: BigInt(paidBy),
            },
            include: { salaryRecord: { include: { user: true } } },
        });
        await this.prisma.cashTransaction.create({
            data: {
                txType: client_1.TxType.EXPENSE,
                sourceModule: 'SALARY',
                refTable: 'salary_payments',
                refId: payment.salaryPaymentId,
                amountIn: 0,
                amountOut: dto.amount,
                method: dto.method || client_1.PayMethod.CASH,
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
    async findUserByIdentifier(identifier) {
        let user = await this.prisma.user.findUnique({ where: { userCode: identifier } });
        if (!user && !isNaN(Number(identifier))) {
            user = await this.prisma.user.findUnique({ where: { userId: BigInt(identifier) } });
        }
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (!user.isActive)
            throw new common_1.BadRequestException('User is not active');
        return user;
    }
    transformAttendance(attendance) {
        return {
            attendanceId: attendance.attendanceId.toString(),
            userId: attendance.userId.toString(),
            workDate: attendance.workDate,
            timeIn: attendance.timeIn,
            timeOut: attendance.timeOut,
            systemHours: Number(attendance.systemHours),
            systemOtHours: Number(attendance.systemOtHours),
            manualOtHours: Number(attendance.manualOtHours),
            remarks: attendance.remarks,
            recordedBy: attendance.recordedBy?.toString(),
            createdAt: attendance.createdAt,
            recorder: attendance.recorder ? {
                userId: attendance.recorder.userId.toString(),
                userCode: attendance.recorder.userCode,
                fullName: attendance.recorder.fullName,
            } : undefined,
            user: attendance.user ? {
                userId: attendance.user.userId.toString(),
                userCode: attendance.user.userCode,
                fullName: attendance.user.fullName,
            } : undefined,
        };
    }
};
exports.AttendanceService = AttendanceService;
exports.AttendanceService = AttendanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AttendanceService);
//# sourceMappingURL=attendance.service.js.map
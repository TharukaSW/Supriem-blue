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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const attendance_service_1 = require("./attendance.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
let AttendanceController = class AttendanceController {
    attendanceService;
    constructor(attendanceService) {
        this.attendanceService = attendanceService;
    }
    clockIn(dto, user) {
        return this.attendanceService.clockIn(dto, user.userId);
    }
    clockOut(dto, user) {
        return this.attendanceService.clockOut(dto, user.userId);
    }
    updateManualOt(id, dto) {
        return this.attendanceService.updateManualOt(BigInt(id), dto);
    }
    findAll(query) {
        return this.attendanceService.findAllAttendance(query);
    }
    searchEmployees(q) {
        return this.attendanceService.searchEmployees(q);
    }
    createSalaryRange(dto) {
        return this.attendanceService.createSalaryRange(dto);
    }
    findAllSalaryRanges() {
        return this.attendanceService.findAllSalaryRanges();
    }
    updateSalaryRange(id, dto) {
        return this.attendanceService.updateSalaryRange(BigInt(id), dto);
    }
    getEmployeeProfile(id) {
        return this.attendanceService.getEmployeeProfile(BigInt(id));
    }
    updateEmployeeProfile(id, dto) {
        return this.attendanceService.updateEmployeeProfile(BigInt(id), dto);
    }
    createSalaryPayment(dto, user) {
        return this.attendanceService.createSalaryPayment(dto, user.userId);
    }
};
exports.AttendanceController = AttendanceController;
__decorate([
    (0, common_1.Post)('clock-in'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER, client_1.RoleName.USER),
    (0, swagger_1.ApiOperation)({ summary: 'Clock in for employee' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.AttendanceInOutDto, Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "clockIn", null);
__decorate([
    (0, common_1.Post)('clock-out'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER, client_1.RoleName.USER),
    (0, swagger_1.ApiOperation)({ summary: 'Clock out for employee' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.AttendanceInOutDto, Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "clockOut", null);
__decorate([
    (0, common_1.Put)(':id/manual-ot'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Update manual OT hours' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateManualOtDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "updateManualOt", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get all attendance records' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.AttendanceQueryDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER, client_1.RoleName.USER),
    (0, swagger_1.ApiOperation)({ summary: 'Search employees for attendance' }),
    (0, swagger_1.ApiQuery)({ name: 'q', required: true }),
    __param(0, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "searchEmployees", null);
__decorate([
    (0, common_1.Post)('salary-ranges'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create salary range' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateSalaryRangeDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "createSalaryRange", null);
__decorate([
    (0, common_1.Get)('salary-ranges'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get all salary ranges' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "findAllSalaryRanges", null);
__decorate([
    (0, common_1.Put)('salary-ranges/:id'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update salary range' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateSalaryRangeDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "updateSalaryRange", null);
__decorate([
    (0, common_1.Get)('employees/:id/profile'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get employee profile with attendance summary' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "getEmployeeProfile", null);
__decorate([
    (0, common_1.Put)('employees/:id/profile'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Update employee profile' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateEmployeeProfileDto]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "updateEmployeeProfile", null);
__decorate([
    (0, common_1.Post)('salary-payments'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Create salary payment' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateSalaryPaymentDto, Object]),
    __metadata("design:returntype", void 0)
], AttendanceController.prototype, "createSalaryPayment", null);
exports.AttendanceController = AttendanceController = __decorate([
    (0, swagger_1.ApiTags)('Attendance & HR'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('attendance'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [attendance_service_1.AttendanceService])
], AttendanceController);
//# sourceMappingURL=attendance.controller.js.map
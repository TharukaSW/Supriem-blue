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
exports.CreateSalaryPaymentDto = exports.UpdateEmployeeProfileDto = exports.UpdateSalaryRangeDto = exports.CreateSalaryRangeDto = exports.AttendanceQueryDto = exports.UpdateManualOtDto = exports.AttendanceInOutDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class AttendanceInOutDto {
    userIdentifier;
}
exports.AttendanceInOutDto = AttendanceInOutDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'SBL001', description: 'User code or user ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AttendanceInOutDto.prototype, "userIdentifier", void 0);
class UpdateManualOtDto {
    manualOtHours;
    remarks;
}
exports.UpdateManualOtDto = UpdateManualOtDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 2.5, description: 'Manual OT hours' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateManualOtDto.prototype, "manualOtHours", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateManualOtDto.prototype, "remarks", void 0);
class AttendanceQueryDto {
    page;
    limit;
    userId;
    fromDate;
    toDate;
}
exports.AttendanceQueryDto = AttendanceQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], AttendanceQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], AttendanceQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AttendanceQueryDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AttendanceQueryDto.prototype, "fromDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AttendanceQueryDto.prototype, "toDate", void 0);
class CreateSalaryRangeDto {
    rangeName;
    minSalary;
    maxSalary;
}
exports.CreateSalaryRangeDto = CreateSalaryRangeDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Junior Staff' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSalaryRangeDto.prototype, "rangeName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 30000 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSalaryRangeDto.prototype, "minSalary", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 50000 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSalaryRangeDto.prototype, "maxSalary", void 0);
class UpdateSalaryRangeDto {
    rangeName;
    minSalary;
    maxSalary;
    isActive;
}
exports.UpdateSalaryRangeDto = UpdateSalaryRangeDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSalaryRangeDto.prototype, "rangeName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateSalaryRangeDto.prototype, "minSalary", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateSalaryRangeDto.prototype, "maxSalary", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateSalaryRangeDto.prototype, "isActive", void 0);
class UpdateEmployeeProfileDto {
    nic;
    address;
    joinedDate;
    designation;
    basicSalary;
    salaryRangeId;
    otRate;
    notes;
}
exports.UpdateEmployeeProfileDto = UpdateEmployeeProfileDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateEmployeeProfileDto.prototype, "nic", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateEmployeeProfileDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateEmployeeProfileDto.prototype, "joinedDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateEmployeeProfileDto.prototype, "designation", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateEmployeeProfileDto.prototype, "basicSalary", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateEmployeeProfileDto.prototype, "salaryRangeId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateEmployeeProfileDto.prototype, "otRate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateEmployeeProfileDto.prototype, "notes", void 0);
class CreateSalaryPaymentDto {
    salaryRecordId;
    payDate;
    amount;
    method;
    referenceNo;
}
exports.CreateSalaryPaymentDto = CreateSalaryPaymentDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSalaryPaymentDto.prototype, "salaryRecordId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSalaryPaymentDto.prototype, "payDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 50000 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSalaryPaymentDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.PayMethod }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.PayMethod),
    __metadata("design:type", String)
], CreateSalaryPaymentDto.prototype, "method", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSalaryPaymentDto.prototype, "referenceNo", void 0);
//# sourceMappingURL=attendance.dto.js.map
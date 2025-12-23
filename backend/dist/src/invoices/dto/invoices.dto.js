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
exports.UpdateInvoiceMatchDto = exports.InvoiceQueryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class InvoiceQueryDto {
    page;
    limit;
    invoiceType;
    status;
    matchStatus;
    customerId;
    supplierId;
    fromDate;
    toDate;
    search;
}
exports.InvoiceQueryDto = InvoiceQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], InvoiceQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], InvoiceQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.InvoiceType }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], InvoiceQueryDto.prototype, "invoiceType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.DocStatus }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], InvoiceQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.MatchStatus }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], InvoiceQueryDto.prototype, "matchStatus", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InvoiceQueryDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InvoiceQueryDto.prototype, "supplierId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InvoiceQueryDto.prototype, "fromDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InvoiceQueryDto.prototype, "toDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], InvoiceQueryDto.prototype, "search", void 0);
class UpdateInvoiceMatchDto {
    vendorInvoiceNo;
    vendorInvoiceDate;
    vendorInvoiceTotal;
}
exports.UpdateInvoiceMatchDto = UpdateInvoiceMatchDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'VINV-001' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateInvoiceMatchDto.prototype, "vendorInvoiceNo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2024-01-15' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateInvoiceMatchDto.prototype, "vendorInvoiceDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 5000 }),
    __metadata("design:type", Number)
], UpdateInvoiceMatchDto.prototype, "vendorInvoiceTotal", void 0);
//# sourceMappingURL=invoices.dto.js.map
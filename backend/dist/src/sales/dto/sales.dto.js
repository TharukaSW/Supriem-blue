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
exports.DispatchQueryDto = exports.UpdateDispatchDto = exports.CreateDispatchDto = exports.SalesQueryDto = exports.UpdateSalesOrderDto = exports.CreateSalesOrderDto = exports.SalesOrderLineDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const client_1 = require("@prisma/client");
class SalesOrderLineDto {
    itemId;
    qty;
    unitPrice;
}
exports.SalesOrderLineDto = SalesOrderLineDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SalesOrderLineDto.prototype, "itemId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 50 }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SalesOrderLineDto.prototype, "qty", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 35.00 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SalesOrderLineDto.prototype, "unitPrice", void 0);
class CreateSalesOrderDto {
    customerId;
    orderDate;
    notes;
    discount;
    tax;
    lines;
}
exports.CreateSalesOrderDto = CreateSalesOrderDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSalesOrderDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '2024-01-15' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSalesOrderDto.prototype, "orderDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateSalesOrderDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSalesOrderDto.prototype, "discount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 0 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateSalesOrderDto.prototype, "tax", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [SalesOrderLineDto] }),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => SalesOrderLineDto),
    __metadata("design:type", Array)
], CreateSalesOrderDto.prototype, "lines", void 0);
class UpdateSalesOrderDto {
    notes;
    discount;
    tax;
}
exports.UpdateSalesOrderDto = UpdateSalesOrderDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateSalesOrderDto.prototype, "notes", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateSalesOrderDto.prototype, "discount", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateSalesOrderDto.prototype, "tax", void 0);
class SalesQueryDto {
    page;
    limit;
    search;
    status;
    customerId;
    fromDate;
    toDate;
}
exports.SalesQueryDto = SalesQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], SalesQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], SalesQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SalesQueryDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.DocStatus }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], SalesQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SalesQueryDto.prototype, "customerId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SalesQueryDto.prototype, "fromDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SalesQueryDto.prototype, "toDate", void 0);
class CreateDispatchDto {
    salesOrderId;
    vehicleNo;
    driverName;
    remarks;
}
exports.CreateDispatchDto = CreateDispatchDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDispatchDto.prototype, "salesOrderId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'CAR-1234' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDispatchDto.prototype, "vehicleNo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'John Driver' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDispatchDto.prototype, "driverName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateDispatchDto.prototype, "remarks", void 0);
class UpdateDispatchDto {
    vehicleNo;
    driverName;
    remarks;
}
exports.UpdateDispatchDto = UpdateDispatchDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'CAR-1234' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateDispatchDto.prototype, "vehicleNo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'John Driver' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateDispatchDto.prototype, "driverName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateDispatchDto.prototype, "remarks", void 0);
class DispatchQueryDto {
    page;
    limit;
    status;
    fromDate;
    toDate;
}
exports.DispatchQueryDto = DispatchQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], DispatchQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], DispatchQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: client_1.DocStatus }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], DispatchQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DispatchQueryDto.prototype, "fromDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], DispatchQueryDto.prototype, "toDate", void 0);
//# sourceMappingURL=sales.dto.js.map
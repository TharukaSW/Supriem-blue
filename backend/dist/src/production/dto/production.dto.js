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
exports.ProductionQueryDto = exports.UpdateProductionDayDto = exports.CreateProductionDayDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateProductionDayDto {
    productionDate;
    finishedProductId;
    quantity;
    scrapQuantity;
    notes;
}
exports.CreateProductionDayDto = CreateProductionDayDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '2024-01-15', description: 'Production date' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductionDayDto.prototype, "productionDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1', description: 'Finished product item ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductionDayDto.prototype, "finishedProductId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 100, description: 'Quantity produced' }),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateProductionDayDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 5, description: 'Scrap quantity' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateProductionDayDto.prototype, "scrapQuantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Production notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductionDayDto.prototype, "notes", void 0);
class UpdateProductionDayDto {
    quantity;
    scrapQuantity;
    notes;
}
exports.UpdateProductionDayDto = UpdateProductionDayDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 100, description: 'Quantity produced' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateProductionDayDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 5, description: 'Scrap quantity' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], UpdateProductionDayDto.prototype, "scrapQuantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Production notes' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateProductionDayDto.prototype, "notes", void 0);
class ProductionQueryDto {
    page;
    limit;
    search;
    fromDate;
    toDate;
}
exports.ProductionQueryDto = ProductionQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Page number' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ProductionQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Items per page' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], ProductionQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search by product name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductionQueryDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'From date filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductionQueryDto.prototype, "fromDate", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'To date filter' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProductionQueryDto.prototype, "toDate", void 0);
//# sourceMappingURL=production.dto.js.map
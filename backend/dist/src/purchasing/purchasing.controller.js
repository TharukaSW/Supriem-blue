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
exports.PurchasingController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const purchasing_service_1 = require("./purchasing.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
let PurchasingController = class PurchasingController {
    purchasingService;
    constructor(purchasingService) {
        this.purchasingService = purchasingService;
    }
    create(dto, user) {
        return this.purchasingService.create(dto, user.userId);
    }
    findAll(query) {
        return this.purchasingService.findAll(query);
    }
    findOne(id) {
        return this.purchasingService.findOne(BigInt(id));
    }
    update(id, dto) {
        return this.purchasingService.update(BigInt(id), dto);
    }
    confirm(id, dto, user) {
        return this.purchasingService.confirm(BigInt(id), dto, user.userId);
    }
    cancel(id) {
        return this.purchasingService.cancel(BigInt(id));
    }
};
exports.PurchasingController = PurchasingController;
__decorate([
    (0, common_1.Post)('orders'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Create purchase order' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreatePurchaseOrderDto, Object]),
    __metadata("design:returntype", void 0)
], PurchasingController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('orders'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get all purchase orders' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.PurchaseQueryDto]),
    __metadata("design:returntype", void 0)
], PurchasingController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('orders/:id'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get purchase order by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PurchasingController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)('orders/:id'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Update purchase order' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdatePurchaseOrderDto]),
    __metadata("design:returntype", void 0)
], PurchasingController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('orders/:id/confirm'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm purchase order and generate invoice' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.ConfirmPurchaseOrderDto, Object]),
    __metadata("design:returntype", void 0)
], PurchasingController.prototype, "confirm", null);
__decorate([
    (0, common_1.Post)('orders/:id/cancel'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel purchase order' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PurchasingController.prototype, "cancel", null);
exports.PurchasingController = PurchasingController = __decorate([
    (0, swagger_1.ApiTags)('Purchasing'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('purchasing'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [purchasing_service_1.PurchasingService])
], PurchasingController);
//# sourceMappingURL=purchasing.controller.js.map
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
exports.SalesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const sales_service_1 = require("./sales.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
let SalesController = class SalesController {
    salesService;
    constructor(salesService) {
        this.salesService = salesService;
    }
    createOrder(dto, user) {
        return this.salesService.createOrder(dto, user.userId);
    }
    findAllOrders(query) {
        return this.salesService.findAllOrders(query);
    }
    findOneOrder(id) {
        return this.salesService.findOneOrder(BigInt(id));
    }
    updateOrder(id, dto) {
        return this.salesService.updateOrder(BigInt(id), dto);
    }
    confirmOrder(id, user) {
        return this.salesService.confirmOrder(BigInt(id), user.userId);
    }
    cancelOrder(id) {
        return this.salesService.cancelOrder(BigInt(id));
    }
    createDispatch(dto, user) {
        return this.salesService.createDispatch(dto, user.userId);
    }
    findAllDispatches(query) {
        return this.salesService.findAllDispatches(query);
    }
    findOneDispatch(id) {
        return this.salesService.findOneDispatch(BigInt(id));
    }
    markDelivered(id) {
        return this.salesService.markDelivered(BigInt(id));
    }
};
exports.SalesController = SalesController;
__decorate([
    (0, common_1.Post)('orders'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Create sales order' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateSalesOrderDto, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "createOrder", null);
__decorate([
    (0, common_1.Get)('orders'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER, client_1.RoleName.USER),
    (0, swagger_1.ApiOperation)({ summary: 'Get all sales orders' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.SalesQueryDto]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "findAllOrders", null);
__decorate([
    (0, common_1.Get)('orders/:id'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER, client_1.RoleName.USER),
    (0, swagger_1.ApiOperation)({ summary: 'Get sales order by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "findOneOrder", null);
__decorate([
    (0, common_1.Put)('orders/:id'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Update sales order' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateSalesOrderDto]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "updateOrder", null);
__decorate([
    (0, common_1.Post)('orders/:id/confirm'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Confirm sales order' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "confirmOrder", null);
__decorate([
    (0, common_1.Post)('orders/:id/cancel'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel sales order' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "cancelOrder", null);
__decorate([
    (0, common_1.Post)('dispatches'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Create dispatch' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateDispatchDto, Object]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "createDispatch", null);
__decorate([
    (0, common_1.Get)('dispatches'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER, client_1.RoleName.USER),
    (0, swagger_1.ApiOperation)({ summary: 'Get all dispatches' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.DispatchQueryDto]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "findAllDispatches", null);
__decorate([
    (0, common_1.Get)('dispatches/:id'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER, client_1.RoleName.USER),
    (0, swagger_1.ApiOperation)({ summary: 'Get dispatch by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "findOneDispatch", null);
__decorate([
    (0, common_1.Post)('dispatches/:id/deliver'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Mark dispatch as delivered' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SalesController.prototype, "markDelivered", null);
exports.SalesController = SalesController = __decorate([
    (0, swagger_1.ApiTags)('Sales'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('sales'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [sales_service_1.SalesService])
], SalesController);
//# sourceMappingURL=sales.controller.js.map
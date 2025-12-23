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
exports.FinanceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const finance_service_1 = require("./finance.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const client_1 = require("@prisma/client");
let FinanceController = class FinanceController {
    financeService;
    constructor(financeService) {
        this.financeService = financeService;
    }
    createExpense(dto, user) {
        return this.financeService.createExpense(dto, user.userId);
    }
    findAllExpenses(query) {
        return this.financeService.findAllExpenses(query);
    }
    findOneExpense(id) {
        return this.financeService.findOneExpense(BigInt(id));
    }
    updateExpense(id, dto) {
        return this.financeService.updateExpense(BigInt(id), dto);
    }
    createPayment(dto, user) {
        return this.financeService.createPayment(dto, user.userId);
    }
    findAllPayments(query) {
        return this.financeService.findAllPayments(query);
    }
    findAllTransactions(query) {
        return this.financeService.findAllTransactions(query);
    }
    getProfitReport(fromDate, toDate) {
        return this.financeService.getProfitReport(fromDate, toDate);
    }
};
exports.FinanceController = FinanceController;
__decorate([
    (0, common_1.Post)('expenses'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Create expense' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateExpenseDto, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "createExpense", null);
__decorate([
    (0, common_1.Get)('expenses'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get all expenses' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ExpenseQueryDto]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "findAllExpenses", null);
__decorate([
    (0, common_1.Get)('expenses/:id'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get expense by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "findOneExpense", null);
__decorate([
    (0, common_1.Put)('expenses/:id'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Update expense' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateExpenseDto]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "updateExpense", null);
__decorate([
    (0, common_1.Post)('payments'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Create payment' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreatePaymentDto, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "createPayment", null);
__decorate([
    (0, common_1.Get)('payments'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get all payments' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.PaymentQueryDto]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "findAllPayments", null);
__decorate([
    (0, common_1.Get)('transactions'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get all cash transactions' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.TransactionQueryDto]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "findAllTransactions", null);
__decorate([
    (0, common_1.Get)('profit'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get profit report' }),
    (0, swagger_1.ApiQuery)({ name: 'fromDate', required: false }),
    (0, swagger_1.ApiQuery)({ name: 'toDate', required: false }),
    __param(0, (0, common_1.Query)('fromDate')),
    __param(1, (0, common_1.Query)('toDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getProfitReport", null);
exports.FinanceController = FinanceController = __decorate([
    (0, swagger_1.ApiTags)('Finance'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('finance'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [finance_service_1.FinanceService])
], FinanceController);
//# sourceMappingURL=finance.controller.js.map
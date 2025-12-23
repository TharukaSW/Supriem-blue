"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const masters_module_1 = require("./masters/masters.module");
const purchasing_module_1 = require("./purchasing/purchasing.module");
const sales_module_1 = require("./sales/sales.module");
const production_module_1 = require("./production/production.module");
const finance_module_1 = require("./finance/finance.module");
const attendance_module_1 = require("./attendance/attendance.module");
const invoices_module_1 = require("./invoices/invoices.module");
const reports_module_1 = require("./reports/reports.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            masters_module_1.MastersModule,
            purchasing_module_1.PurchasingModule,
            sales_module_1.SalesModule,
            production_module_1.ProductionModule,
            finance_module_1.FinanceModule,
            attendance_module_1.AttendanceModule,
            invoices_module_1.InvoicesModule,
            reports_module_1.ReportsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map
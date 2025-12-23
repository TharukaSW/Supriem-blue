"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchasingModule = void 0;
const common_1 = require("@nestjs/common");
const purchasing_service_1 = require("./purchasing.service");
const purchasing_controller_1 = require("./purchasing.controller");
const masters_module_1 = require("../masters/masters.module");
let PurchasingModule = class PurchasingModule {
};
exports.PurchasingModule = PurchasingModule;
exports.PurchasingModule = PurchasingModule = __decorate([
    (0, common_1.Module)({
        imports: [masters_module_1.MastersModule],
        controllers: [purchasing_controller_1.PurchasingController],
        providers: [purchasing_service_1.PurchasingService],
        exports: [purchasing_service_1.PurchasingService],
    })
], PurchasingModule);
//# sourceMappingURL=purchasing.module.js.map
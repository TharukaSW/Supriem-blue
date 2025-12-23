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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const users_service_1 = require("./users.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    create(createUserDto) {
        return this.usersService.create(createUserDto);
    }
    findAll(query) {
        return this.usersService.findAll(query);
    }
    getRoles() {
        return this.usersService.getRoles();
    }
    findOne(id) {
        return this.usersService.findOne(BigInt(id));
    }
    update(id, updateUserDto) {
        return this.usersService.update(BigInt(id), updateUserDto);
    }
    changePassword(id, dto) {
        return this.usersService.changePassword(BigInt(id), dto.oldPassword, dto.newPassword);
    }
    deactivate(id) {
        return this.usersService.deactivate(BigInt(id));
    }
    activate(id) {
        return this.usersService.activate(BigInt(id));
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Create a new user' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateUserDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get all users with pagination' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.UserQueryDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('roles'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get all roles' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "getRoles", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER),
    (0, swagger_1.ApiOperation)({ summary: 'Get user by ID' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Update user' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateUserDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':id/change-password'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN, client_1.RoleName.MANAGER, client_1.RoleName.USER),
    (0, swagger_1.ApiOperation)({ summary: 'Change user password' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.ChangePasswordDto]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Put)(':id/deactivate'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate user' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "deactivate", null);
__decorate([
    (0, common_1.Put)(':id/activate'),
    (0, roles_decorator_1.Roles)(client_1.RoleName.ADMIN),
    (0, swagger_1.ApiOperation)({ summary: 'Activate user' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: 'string' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "activate", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map
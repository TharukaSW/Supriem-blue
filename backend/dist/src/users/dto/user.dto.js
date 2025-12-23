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
exports.UserQueryDto = exports.UserResponseDto = exports.ChangePasswordDto = exports.UpdateUserDto = exports.CreateUserDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class CreateUserDto {
    roleId;
    fullName;
    username;
    email;
    phone;
    password;
}
exports.CreateUserDto = CreateUserDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 1, description: 'Role ID (1=ADMIN, 2=MANAGER, 3=USER)' }),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateUserDto.prototype, "roleId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John Doe', description: 'Full name of the user' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], CreateUserDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'john.doe', description: 'Username for login' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'john@example.com', description: 'Email address' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+94771234567', description: 'Phone number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateUserDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Password@123', description: 'Password (min 8 chars, 1 uppercase, 1 number)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    (0, class_validator_1.Matches)(/^(?=.*[A-Z])(?=.*\d)/, {
        message: 'Password must contain at least one uppercase letter and one number',
    }),
    __metadata("design:type", String)
], CreateUserDto.prototype, "password", void 0);
class UpdateUserDto {
    fullName;
    username;
    email;
    phone;
    isActive;
}
exports.UpdateUserDto = UpdateUserDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'John Doe Updated', description: 'Full name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'john.doe', description: 'Username' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'john@example.com', description: 'Email' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: '+94771234567', description: 'Phone' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateUserDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true, description: 'Is user active' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateUserDto.prototype, "isActive", void 0);
class ChangePasswordDto {
    oldPassword;
    newPassword;
}
exports.ChangePasswordDto = ChangePasswordDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'OldPassword@123' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "oldPassword", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'NewPassword@123' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(8),
    (0, class_validator_1.Matches)(/^(?=.*[A-Z])(?=.*\d)/, {
        message: 'Password must contain at least one uppercase letter and one number',
    }),
    __metadata("design:type", String)
], ChangePasswordDto.prototype, "newPassword", void 0);
class UserResponseDto {
    userId;
    userCode;
    roleId;
    fullName;
    username;
    email;
    phone;
    isActive;
    createdAt;
    updatedAt;
    role;
}
exports.UserResponseDto = UserResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserResponseDto.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserResponseDto.prototype, "userCode", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], UserResponseDto.prototype, "roleId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], UserResponseDto.prototype, "fullName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], UserResponseDto.prototype, "username", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], UserResponseDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", String)
], UserResponseDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], UserResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], UserResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Date)
], UserResponseDto.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    __metadata("design:type", Object)
], UserResponseDto.prototype, "role", void 0);
class UserQueryDto {
    page;
    limit;
    search;
    roleId;
    isActive;
}
exports.UserQueryDto = UserQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1, description: 'Page number' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UserQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 10, description: 'Items per page' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UserQueryDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 'john', description: 'Search term' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UserQueryDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: 1, description: 'Filter by role ID' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UserQueryDto.prototype, "roleId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ example: true, description: 'Filter by active status' }),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Boolean)
], UserQueryDto.prototype, "isActive", void 0);
//# sourceMappingURL=user.dto.js.map
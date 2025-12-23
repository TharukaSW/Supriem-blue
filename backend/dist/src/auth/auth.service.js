"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const bcrypt = __importStar(require("bcryptjs"));
let AuthService = class AuthService {
    usersService;
    jwtService;
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async validateUser(username, password) {
        let user = await this.usersService.findByUsername(username);
        if (!user) {
            user = await this.usersService.findByUserCode(username);
        }
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('User account is deactivated');
        }
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        return user;
    }
    async login(loginDto) {
        const user = await this.validateUser(loginDto.username, loginDto.password);
        const payload = {
            sub: user.userId.toString(),
            userCode: user.userCode,
            role: user.role.roleName,
        };
        const accessToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET,
            expiresIn: (process.env.JWT_EXPIRES_IN || '15m'),
        });
        const refreshToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d'),
        });
        return {
            accessToken,
            refreshToken,
            user: {
                userId: user.userId.toString(),
                userCode: user.userCode,
                fullName: user.fullName,
                role: user.role.roleName,
            },
        };
    }
    async refreshToken(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET,
            });
            const user = await this.usersService.findOne(BigInt(payload.sub));
            if (!user) {
                throw new common_1.UnauthorizedException('User not found');
            }
            const newPayload = {
                sub: payload.sub,
                userCode: payload.userCode,
                role: payload.role,
            };
            const accessToken = this.jwtService.sign(newPayload, {
                secret: process.env.JWT_SECRET,
                expiresIn: (process.env.JWT_EXPIRES_IN || '15m'),
            });
            const newRefreshToken = this.jwtService.sign(newPayload, {
                secret: process.env.JWT_REFRESH_SECRET,
                expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d'),
            });
            return {
                accessToken,
                refreshToken: newRefreshToken,
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async getProfile(userId) {
        return this.usersService.findOne(BigInt(userId));
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map
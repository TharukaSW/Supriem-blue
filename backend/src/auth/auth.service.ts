import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(username: string, password: string) {
        // Try to find by username first, then by user code
        let user = await this.usersService.findByUsername(username);

        if (!user) {
            user = await this.usersService.findByUserCode(username);
        }

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (!user.isActive) {
            throw new UnauthorizedException('User account is deactivated');
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return user;
    }

    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.username, loginDto.password);

        const payload = {
            sub: user.userId.toString(),
            userCode: user.userCode,
            role: user.role.roleName,
        };

        const accessToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_SECRET,
            expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as any,
        });

        const refreshToken = this.jwtService.sign(payload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any,
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

    async refreshToken(refreshToken: string) {
        try {
            const payload = this.jwtService.verify(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET,
            });

            const user = await this.usersService.findOne(BigInt(payload.sub));
            if (!user) {
                throw new UnauthorizedException('User not found');
            }

            const newPayload = {
                sub: payload.sub,
                userCode: payload.userCode,
                role: payload.role,
            };

            const accessToken = this.jwtService.sign(newPayload, {
                secret: process.env.JWT_SECRET,
                expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as any,
            });

            const newRefreshToken = this.jwtService.sign(newPayload, {
                secret: process.env.JWT_REFRESH_SECRET,
                expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any,
            });

            return {
                accessToken,
                refreshToken: newRefreshToken,
            };
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async getProfile(userId: string) {
        return this.usersService.findOne(BigInt(userId));
    }
}

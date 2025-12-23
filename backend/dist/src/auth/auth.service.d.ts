import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(username: string, password: string): Promise<{
        role: {
            roleId: number;
            roleName: import(".prisma/client").$Enums.RoleName;
            idPrefix: string;
            description: string | null;
        };
    } & {
        roleId: number;
        userId: bigint;
        userCode: string;
        username: string | null;
        fullName: string;
        email: string | null;
        phone: string | null;
        passwordHash: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            userId: string;
            userCode: string;
            fullName: string;
            role: import(".prisma/client").$Enums.RoleName;
        };
    }>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    getProfile(userId: string): Promise<any>;
}

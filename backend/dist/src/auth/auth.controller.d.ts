import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto } from './dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
    refresh(dto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    getProfile(user: any): Promise<any>;
}

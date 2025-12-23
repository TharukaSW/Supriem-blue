export declare class LoginDto {
    username: string;
    password: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class AuthResponseDto {
    accessToken: string;
    refreshToken: string;
    user: {
        userId: string;
        userCode: string;
        fullName: string;
        role: string;
    };
}

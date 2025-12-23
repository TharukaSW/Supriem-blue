export declare class CreateUserDto {
    roleId: number;
    fullName: string;
    username?: string;
    email?: string;
    phone?: string;
    password: string;
}
export declare class UpdateUserDto {
    fullName?: string;
    username?: string;
    email?: string;
    phone?: string;
    isActive?: boolean;
}
export declare class ChangePasswordDto {
    oldPassword: string;
    newPassword: string;
}
export declare class UserResponseDto {
    userId: string;
    userCode: string;
    roleId: number;
    fullName: string;
    username?: string;
    email?: string;
    phone?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    role?: {
        roleName: string;
        idPrefix: string;
    };
}
export declare class UserQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    roleId?: number;
    isActive?: boolean;
}

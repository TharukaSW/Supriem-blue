import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsBoolean, IsInt, MinLength, Matches } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({ example: 1, description: 'Role ID (1=ADMIN, 2=MANAGER, 3=USER)' })
    @IsInt()
    roleId: number;

    @ApiProperty({ example: 'John Doe', description: 'Full name of the user' })
    @IsString()
    @MinLength(2)
    fullName: string;

    @ApiPropertyOptional({ example: 'john.doe', description: 'Username for login' })
    @IsOptional()
    @IsString()
    username?: string;

    @ApiPropertyOptional({ example: 'john@example.com', description: 'Email address' })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({ example: '+94771234567', description: 'Phone number' })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({ example: 'Password@123', description: 'Password (min 8 chars, 1 uppercase, 1 number)' })
    @IsString()
    @MinLength(8)
    @Matches(/^(?=.*[A-Z])(?=.*\d)/, {
        message: 'Password must contain at least one uppercase letter and one number',
    })
    password: string;
}

export class UpdateUserDto {
    @ApiPropertyOptional({ example: 'John Doe Updated', description: 'Full name' })
    @IsOptional()
    @IsString()
    @MinLength(2)
    fullName?: string;

    @ApiPropertyOptional({ example: 'john.doe', description: 'Username' })
    @IsOptional()
    @IsString()
    username?: string;

    @ApiPropertyOptional({ example: 'john@example.com', description: 'Email' })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({ example: '+94771234567', description: 'Phone' })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({ example: true, description: 'Is user active' })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}

export class ChangePasswordDto {
    @ApiProperty({ example: 'OldPassword@123' })
    @IsString()
    oldPassword: string;

    @ApiProperty({ example: 'NewPassword@123' })
    @IsString()
    @MinLength(8)
    @Matches(/^(?=.*[A-Z])(?=.*\d)/, {
        message: 'Password must contain at least one uppercase letter and one number',
    })
    newPassword: string;
}

export class UserResponseDto {
    @ApiProperty()
    userId: string;

    @ApiProperty()
    userCode: string;

    @ApiProperty()
    roleId: number;

    @ApiProperty()
    fullName: string;

    @ApiPropertyOptional()
    username?: string;

    @ApiPropertyOptional()
    email?: string;

    @ApiPropertyOptional()
    phone?: string;

    @ApiProperty()
    isActive: boolean;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    @ApiPropertyOptional()
    role?: {
        roleName: string;
        idPrefix: string;
    };
}

export class UserQueryDto {
    @ApiPropertyOptional({ example: 1, description: 'Page number' })
    @IsOptional()
    page?: number;

    @ApiPropertyOptional({ example: 10, description: 'Items per page' })
    @IsOptional()
    limit?: number;

    @ApiPropertyOptional({ example: 'john', description: 'Search term' })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({ example: 1, description: 'Filter by role ID' })
    @IsOptional()
    roleId?: number;

    @ApiPropertyOptional({ example: true, description: 'Filter by active status' })
    @IsOptional()
    isActive?: boolean;
}

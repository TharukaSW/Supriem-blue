import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
    @ApiProperty({ example: 'SBA001', description: 'User code or username' })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({ example: 'Admin@123', description: 'Password' })
    @IsString()
    @IsNotEmpty()
    password: string;
}

export class RefreshTokenDto {
    @ApiProperty({ description: 'Refresh token' })
    @IsString()
    @IsNotEmpty()
    refreshToken: string;
}

export class AuthResponseDto {
    @ApiProperty()
    accessToken: string;

    @ApiProperty()
    refreshToken: string;

    @ApiProperty()
    user: {
        userId: string;
        userCode: string;
        fullName: string;
        role: string;
    };
}

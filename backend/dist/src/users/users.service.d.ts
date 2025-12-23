import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createUserDto: CreateUserDto): Promise<any>;
    findAll(query: UserQueryDto): Promise<{
        data: any[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: bigint): Promise<any>;
    findByUsername(username: string): Promise<({
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
    }) | null>;
    findByUserCode(userCode: string): Promise<({
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
    }) | null>;
    update(id: bigint, updateUserDto: UpdateUserDto): Promise<any>;
    deactivate(id: bigint): Promise<{
        message: string;
    }>;
    activate(id: bigint): Promise<{
        message: string;
    }>;
    changePassword(id: bigint, oldPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    private generateUserCode;
    private transformUser;
    getRoles(): Promise<{
        roleId: number;
        roleName: import(".prisma/client").$Enums.RoleName;
        idPrefix: string;
        description: string | null;
    }[]>;
}

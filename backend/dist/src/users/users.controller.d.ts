import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserQueryDto, ChangePasswordDto } from './dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
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
    getRoles(): Promise<{
        roleId: number;
        roleName: import(".prisma/client").$Enums.RoleName;
        idPrefix: string;
        description: string | null;
    }[]>;
    findOne(id: string): Promise<any>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<any>;
    changePassword(id: string, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    deactivate(id: string): Promise<{
        message: string;
    }>;
    activate(id: string): Promise<{
        message: string;
    }>;
}

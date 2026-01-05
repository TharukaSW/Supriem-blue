import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './dto';
import * as bcrypt from 'bcryptjs';
import { RoleName } from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(createUserDto: CreateUserDto) {
        // Get the role to determine prefix
        const role = await this.prisma.role.findUnique({
            where: { roleId: createUserDto.roleId },
        });

        if (!role) {
            throw new NotFoundException('Role not found');
        }

        // Generate user code
        const userCode = await this.generateUserCode(role.idPrefix);

        // Hash password
        const passwordHash = await bcrypt.hash(createUserDto.password, 10);

        // Check if username already exists
        if (createUserDto.username) {
            const existingUser = await this.prisma.user.findUnique({
                where: { username: createUserDto.username },
            });
            if (existingUser) {
                throw new ConflictException('Username already exists');
            }
        }

        const user = await this.prisma.user.create({
            data: {
                userCode,
                roleId: createUserDto.roleId,
                fullName: createUserDto.fullName,
                username: createUserDto.username,
                email: createUserDto.email,
                phone: createUserDto.phone,
                passwordHash,
            },
            include: {
                role: true,
            },
        });

        // Create employee profile for the user
        await this.prisma.employeeProfile.create({
            data: {
                userId: user.userId,
            },
        });

        const { passwordHash: _, ...result } = user;
        return this.transformUser(result);
    }

    async findAll(query: UserQueryDto) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (query.search) {
            where.OR = [
                { fullName: { contains: query.search, mode: 'insensitive' } },
                { userCode: { contains: query.search, mode: 'insensitive' } },
                { email: { contains: query.search, mode: 'insensitive' } },
                { username: { contains: query.search, mode: 'insensitive' } },
            ];
        }

        if (query.roleId) {
            where.roleId = Number(query.roleId);
        }

        if (query.isActive !== undefined) {
            where.isActive = query.isActive === true || String(query.isActive) === 'true';
        }

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                include: { role: true },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where }),
        ]);

        return {
            data: users.map((u) => {
                const { passwordHash, ...rest } = u;
                return this.transformUser(rest);
            }),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: bigint) {
        const user = await this.prisma.user.findUnique({
            where: { userId: id },
            include: {
                role: true,
                employeeProfile: {
                    include: { salaryRange: true },
                },
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const { passwordHash, ...result } = user;
        return this.transformUser(result);
    }

    async findByUsername(username: string) {
        return this.prisma.user.findUnique({
            where: { username },
            include: { role: true },
        });
    }

    async findByUserCode(userCode: string) {
        return this.prisma.user.findUnique({
            where: { userCode },
            include: { role: true },
        });
    }

    async update(id: bigint, updateUserDto: UpdateUserDto) {
        const user = await this.prisma.user.findUnique({ where: { userId: id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        if (updateUserDto.username) {
            const existingUser = await this.prisma.user.findFirst({
                where: {
                    username: updateUserDto.username,
                    NOT: { userId: id },
                },
            });
            if (existingUser) {
                throw new ConflictException('Username already exists');
            }
        }

        const updated = await this.prisma.user.update({
            where: { userId: id },
            data: updateUserDto,
            include: { role: true },
        });

        const { passwordHash, ...result } = updated;
        return this.transformUser(result);
    }

    async deactivate(id: bigint) {
        const user = await this.prisma.user.findUnique({ where: { userId: id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        await this.prisma.user.update({
            where: { userId: id },
            data: { isActive: false },
        });

        return { message: 'User deactivated successfully' };
    }

    async activate(id: bigint) {
        const user = await this.prisma.user.findUnique({ where: { userId: id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        await this.prisma.user.update({
            where: { userId: id },
            data: { isActive: true },
        });

        return { message: 'User activated successfully' };
    }

    async changePassword(id: bigint, oldPassword: string, newPassword: string) {
        const user = await this.prisma.user.findUnique({ where: { userId: id } });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const isValid = await bcrypt.compare(oldPassword, user.passwordHash);
        if (!isValid) {
            throw new ConflictException('Invalid current password');
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({
            where: { userId: id },
            data: { passwordHash },
        });

        return { message: 'Password changed successfully' };
    }

    private async generateUserCode(prefix: string): Promise<string> {
        const lastUser = await this.prisma.user.findFirst({
            where: { userCode: { startsWith: prefix } },
            orderBy: { userCode: 'desc' },
        });

        let nextNumber = 1;
        if (lastUser) {
            const currentNumber = parseInt(lastUser.userCode.replace(prefix, ''), 10);
            nextNumber = currentNumber + 1;
        }

        return `${prefix}${nextNumber.toString().padStart(3, '0')}`;
    }

    private transformUser(user: any) {
        return {
            ...user,
            userId: user.userId.toString(),
            employeeProfile: user.employeeProfile
                ? {
                    ...user.employeeProfile,
                    userId: user.employeeProfile.userId.toString(),
                    salaryRangeId: user.employeeProfile.salaryRangeId?.toString(),
                }
                : undefined,
        };
    }

    async getRoles() {
        return this.prisma.role.findMany();
    }
}

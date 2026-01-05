import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserQueryDto, ChangePasswordDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RoleName } from '@prisma/client';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @Roles(RoleName.ADMIN)
    @ApiOperation({ summary: 'Create a new user' })
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Get()
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Get all users with pagination' })
    findAll(@Query() query: UserQueryDto) {
        return this.usersService.findAll(query);
    }

    @Get('roles')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Get all roles' })
    getRoles() {
        return this.usersService.getRoles();
    }

    @Get(':id')
    @Roles(RoleName.ADMIN, RoleName.MANAGER)
    @ApiOperation({ summary: 'Get user by ID' })
    @ApiParam({ name: 'id', type: 'string' })
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(BigInt(id));
    }

    @Put(':id')
    @Roles(RoleName.ADMIN)
    @ApiOperation({ summary: 'Update user' })
    @ApiParam({ name: 'id', type: 'string' })
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(BigInt(id), updateUserDto);
    }

    @Put(':id/change-password')
    @Roles(RoleName.ADMIN, RoleName.MANAGER, RoleName.USER)
    @ApiOperation({ summary: 'Change user password' })
    @ApiParam({ name: 'id', type: 'string' })
    changePassword(@Param('id') id: string, @Body() dto: ChangePasswordDto) {
        return this.usersService.changePassword(BigInt(id), dto.oldPassword, dto.newPassword);
    }

    @Put(':id/deactivate')
    @Roles(RoleName.ADMIN)
    @ApiOperation({ summary: 'Deactivate user' })
    @ApiParam({ name: 'id', type: 'string' })
    deactivate(@Param('id') id: string) {
        return this.usersService.deactivate(BigInt(id));
    }

    @Put(':id/activate')
    @Roles(RoleName.ADMIN)
    @ApiOperation({ summary: 'Activate user' })
    @ApiParam({ name: 'id', type: 'string' })
    activate(@Param('id') id: string) {
        return this.usersService.activate(BigInt(id));
    }
}

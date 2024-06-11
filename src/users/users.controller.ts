import { Body, Controller, Delete, Get, Param, Patch, Post, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { Auth } from 'src/decorators/auth.decorator';
import { Authenticated } from 'src/decorators/authenticated.decorator';
import { User, UserRole } from './interfaces/user.interface';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dtos/login-dto';
import { PatchUserDto } from './dtos/patch-user.dto';

@ApiTags('v1/users')
@Controller('v1/users')
export class UsersController {

    constructor(
        private readonly usersService: UsersService,
    ) {}

    @ApiBearerAuth()
    @Get()
    @Auth('ADMIN')
    async getAll(@Authenticated() authenticatedUser: AuthenticatedUser): Promise<User[]> {
        return this.usersService.getAllByAccountId(authenticatedUser.accountId);
    }

    @ApiBearerAuth()
    @Get('me')
    @Auth()
    async get(@Authenticated() authenticatedUser: AuthenticatedUser): Promise<User> {
        return this.usersService.getByUid(authenticatedUser.uid);
    }

    @Post('login')
    // TODO: remover?, este endpoint é apenas para testes
    async login(@Body() loginDto: LoginDto) {
        return this.usersService.login(loginDto.email, loginDto.password);
    }

    @ApiBearerAuth()
    @Delete()
    @Auth()
    // TODO: remover ou trocar, este endpoint é apenas para testes
    async delete(@Authenticated() authenticatedUser: AuthenticatedUser): Promise<void> {
        await this.usersService.delete(authenticatedUser.uid);
    }

    @ApiBearerAuth()
    @Patch('me')
    @Auth('ADMIN', 'USER')
    async patchMe(@Authenticated() authenticatedUser: AuthenticatedUser, @Body() patchUserDto: PatchUserDto): Promise<void> {
        await this.usersService.patch(authenticatedUser.accountId, authenticatedUser.userId, patchUserDto);
    }

    @ApiBearerAuth()
    @Patch(':userid')
    @Auth('ADMIN')
    async patch(@Authenticated() authenticatedUser: AuthenticatedUser, @Param('userid') userId: string, @Body() patchUserDto: PatchUserDto): Promise<void> {
        if(userId === authenticatedUser.userId) throw new Error('invalid.use.me.uri');
        
        await this.usersService.patch(authenticatedUser.accountId, userId, patchUserDto);
    }
}

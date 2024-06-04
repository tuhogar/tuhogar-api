import { Body, Controller, Delete, Get, NotFoundException, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { Auth } from 'src/decorators/auth.decorator';
import { Authenticated } from 'src/decorators/authenticated.decorator';
import { User } from './interfaces/user.interface';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dtos/login-dto';

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
        const user = await this.usersService.getById(authenticatedUser.uid);
        if (!user) throw new NotFoundException('notfound.user.do.not.exists');

        return user;
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.usersService.login(loginDto.email, loginDto.password);
    }

    @ApiBearerAuth()
    @Delete()
    @Auth()
    async delete(@Authenticated() authenticatedUser: AuthenticatedUser): Promise<void> {
        await this.usersService.delete(authenticatedUser.uid);
    }
}

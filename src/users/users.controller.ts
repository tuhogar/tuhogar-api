import { Body, Controller, Get, NotFoundException, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { Auth } from 'src/decorators/auth.decorator';
import { Authenticated } from 'src/decorators/authenticated.decorator';
import { User } from './interfaces/user.interface';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';

@Controller('v1/users')
export class UsersController {

    constructor(
        private readonly usersService: UsersService,
    ) {}

    @Get()
    @Auth('ADMIN')
    async getAll(@Authenticated() authenticatedUser: AuthenticatedUser): Promise<User[]> {
        return this.usersService.getAllByAccountId(authenticatedUser.accountId);
    }

    @Get('me')
    @Auth()
    async get(@Authenticated() authenticatedUser: AuthenticatedUser): Promise<User> {
        const user = await this.usersService.getById(authenticatedUser.uid);
        if (!user) throw new NotFoundException('notfound.user.do.not.exists');

        return user;
    }

    @Post('login')
    async login(@Body('email') email: string, @Body('password') password: string) {
        return this.usersService.login(email, password);
    }
}

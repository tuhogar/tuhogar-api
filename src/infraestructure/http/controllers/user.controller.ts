import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { UserService } from 'src/application/use-cases/user/user.service';
import { Auth } from 'src/infraestructure/decorators/auth.decorator';
import { Authenticated } from 'src/infraestructure/decorators/authenticated.decorator';
import { User, UserRole } from 'src/domain/entities/user.interface';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user.interface';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LoginDto } from 'src/infraestructure/http/dtos/user/login-dto';
import { PatchUserDto } from 'src/infraestructure/http/dtos/user/patch-user.dto';
import { UpdateStatusUserDto } from 'src/infraestructure/http/dtos/user/update-status-user.dto';
import { CreateFavoriteAdvertisementDto } from 'src/infraestructure/http/dtos/user/create-favorite-advertisement.dto';

@ApiTags('v1/users')
@Controller('v1/users')
export class UserController {

    constructor(
        private readonly userService: UserService,
    ) {}

    /*
    @ApiBearerAuth()
    @Post('user-master-user')
    @Auth()
    async createMaster(@Authenticated() authenticatedUser: AuthenticatedUser, @Body() createUserMasterDto: CreateUserMasterDto): Promise<void> {
        await this.userService.createMaster(
            authenticatedUser,
            createUserMasterDto,
        );
    }
    */

    @ApiBearerAuth()
    @Get()
    @Auth('ADMIN')
    async getAll(@Authenticated() authenticatedUser: AuthenticatedUser): Promise<User[]> {
        return this.userService.getAllByAccountId(authenticatedUser.accountId);
    }

    @ApiBearerAuth()
    @Get('me')
    @Auth()
    async get(@Authenticated() authenticatedUser: AuthenticatedUser): Promise<User> {
        return this.userService.getByUid(authenticatedUser.uid);
    }

    @Post('login')
    // TODO: remover?, este endpoint é apenas para testes
    async login(@Body() loginDto: LoginDto) {
        return this.userService.login(loginDto.email, loginDto.password);
    }

    @ApiBearerAuth()
    @Post('favorites')
    @Auth('ADMIN', 'USER')
    async createFavorite(@Authenticated() authenticatedUser: AuthenticatedUser, @Body() createFavoriteAdvertisementDto: CreateFavoriteAdvertisementDto): Promise<void> {
        await this.userService.createFavorite(authenticatedUser.userId, createFavoriteAdvertisementDto.id);
    }

    @ApiBearerAuth()
    @Get('favorites')
    @Auth('ADMIN', 'USER')
    async getFavorites(@Authenticated() authenticatedUser: AuthenticatedUser): Promise<any[]> {
        return this.userService.getFavorites(authenticatedUser.userId);
    }

    @ApiBearerAuth()
    @Delete('favorites/:advertisementid')
    @Auth('ADMIN', 'USER')
    async deleteFavorite(@Authenticated() authenticatedUser: AuthenticatedUser, @Param('advertisementid') advertisementId: string): Promise<void> {
        await this.userService.deleteFavorite(authenticatedUser.userId, advertisementId);
    }

    /*
    @ApiBearerAuth()
    @Delete('me')
    @Auth('MASTER', 'ADMIN', 'USER')
    // TODO: remover ou trocar, este endpoint é apenas para testes
    async deleteMe(@Authenticated() authenticatedUser: AuthenticatedUser): Promise<void> {
        await this.userService.deleteMe(authenticatedUser.uid);
    }
    */

    @ApiBearerAuth()
    @Patch(':userid')
    @Auth('MASTER', 'ADMIN', 'USER')
    async patch(@Authenticated() authenticatedUser: AuthenticatedUser, @Param('userid') userId: string, @Body() patchUserDto: PatchUserDto): Promise<void> {
        if(authenticatedUser.userRole === UserRole.USER && userId !== authenticatedUser.userId) throw new Error('Unauthorized');
        
        await this.userService.patch(authenticatedUser, userId, patchUserDto);
    }

    @ApiBearerAuth()
    @Put(':userid/status')
    @Auth('MASTER', 'ADMIN')
    async updateStatus(@Authenticated() authenticatedUser: AuthenticatedUser, @Param('userid') userId: string, @Body() updateStatusUserDto: UpdateStatusUserDto): Promise<void> {
        if(userId === authenticatedUser.userId) throw new Error('Unauthorized');

        await this.userService.updateStatus(authenticatedUser, userId, updateStatusUserDto);
    }

    @ApiBearerAuth()
    @Delete(':userid')
    @Auth('ADMIN')
    async delete(@Authenticated() authenticatedUser: AuthenticatedUser, @Param('userid') userId: string): Promise<void> {
        if(userId === authenticatedUser.userId) throw new Error('Unauthorized');
        
        await this.userService.delete(authenticatedUser, userId);
    }
}
import { Body, Controller, Delete, Get, Param, Patch, Post, Put } from '@nestjs/common';
import { Auth } from 'src/infraestructure/decorators/auth.decorator';
import { Authenticated } from 'src/infraestructure/decorators/authenticated.decorator';
import { User, UserRole } from 'src/domain/entities/user';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LoginDto } from 'src/infraestructure/http/dtos/user/login-dto';
import { PatchUserDto } from 'src/infraestructure/http/dtos/user/patch-user.dto';
import { UpdateStatusUserDto } from 'src/infraestructure/http/dtos/user/update-status-user.dto';
import { CreateFavoriteAdvertisementDto } from 'src/infraestructure/http/dtos/user/create-favorite-advertisement.dto';
import { CreateFavoriteUserUseCase } from 'src/application/use-cases/user/create-favorite-user.use-case';
import { DeleteFavoriteUserUseCase } from 'src/application/use-cases/user/delete-favorite-user.use-case';
import { DeleteUserUseCase } from 'src/application/use-cases/user/delete-user.use-case';
import { GetAllByAccountIdUserUseCase } from 'src/application/use-cases/user/get-all-by-account-id-user.use-case';
import { GetByUidUserUseCase } from 'src/application/use-cases/user/get-by-uid-user.use-case';
import { GetFavoritesUserUseCase } from 'src/application/use-cases/user/get-favorites-user.use-case';
import { LoginUserUseCase } from 'src/application/use-cases/user/login-user.use-case';
import { PathUserUseCase } from 'src/application/use-cases/user/path-user.use-case';
import { UpdateStatusUserUseCase } from 'src/application/use-cases/user/update-status-user.use-case';

@ApiTags('v1/users')
@Controller('v1/users')
export class UserController {

    constructor(
        private readonly createFavoriteUserUseCase: CreateFavoriteUserUseCase,
        private readonly deleteFavoriteUserUseCase: DeleteFavoriteUserUseCase,
        private readonly deleteUserUseCase: DeleteUserUseCase,
        private readonly getAllByAccountIdUserUseCase: GetAllByAccountIdUserUseCase,
        private readonly getByUidUserUseCase: GetByUidUserUseCase,
        private readonly getFavoritesUserUseCase: GetFavoritesUserUseCase,
        private readonly loginUserUseCase: LoginUserUseCase,
        private readonly pathUserUseCase: PathUserUseCase,
        private readonly updateStatusUserUseCase: UpdateStatusUserUseCase,
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
        return this.getAllByAccountIdUserUseCase.execute(authenticatedUser.accountId);
    }

    @ApiBearerAuth()
    @Get('me')
    @Auth()
    async get(@Authenticated() authenticatedUser: AuthenticatedUser): Promise<User> {
        return this.getByUidUserUseCase.execute(authenticatedUser.uid);
    }

    @Post('login')
    // TODO: remover?, este endpoint é apenas para testes
    async login(@Body() loginDto: LoginDto) {
        return this.loginUserUseCase.execute(loginDto.email, loginDto.password);
    }

    @ApiBearerAuth()
    @Post('favorites')
    @Auth('ADMIN', 'USER')
    async createFavorite(@Authenticated() authenticatedUser: AuthenticatedUser, @Body() createFavoriteAdvertisementDto: CreateFavoriteAdvertisementDto): Promise<User> {
        const response = await this.createFavoriteUserUseCase.execute(authenticatedUser.userId, createFavoriteAdvertisementDto.id);
        return response;
    }

    @ApiBearerAuth()
    @Get('favorites')
    @Auth('ADMIN', 'USER')
    async getFavorites(@Authenticated() authenticatedUser: AuthenticatedUser): Promise<any[]> {
        return this.getFavoritesUserUseCase.execute(authenticatedUser.userId);
    }

    @ApiBearerAuth()
    @Delete('favorites/:advertisementid')
    @Auth('ADMIN', 'USER')
    async deleteFavorite(@Authenticated() authenticatedUser: AuthenticatedUser, @Param('advertisementid') advertisementId: string): Promise<void> {
        await this.deleteFavoriteUserUseCase.execute(authenticatedUser.userId, advertisementId);
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
        
        await this.pathUserUseCase.execute(authenticatedUser, userId, patchUserDto);
    }

    @ApiBearerAuth()
    @Put(':userid/status')
    @Auth('MASTER', 'ADMIN')
    async updateStatus(@Authenticated() authenticatedUser: AuthenticatedUser, @Param('userid') userId: string, @Body() updateStatusUserDto: UpdateStatusUserDto): Promise<void> {
        if(userId === authenticatedUser.userId) throw new Error('Unauthorized');

        await this.updateStatusUserUseCase.execute(authenticatedUser, userId, updateStatusUserDto);
    }

    @ApiBearerAuth()
    @Delete(':userid')
    @Auth('ADMIN')
    async delete(@Authenticated() authenticatedUser: AuthenticatedUser, @Param('userid') userId: string): Promise<void> {
        if(userId === authenticatedUser.userId) throw new Error('Unauthorized');
        
        await this.deleteUserUseCase.execute(authenticatedUser, userId);
    }
}
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
import { GetAllUserByAccountIdUseCase } from 'src/application/use-cases/user/get-all-user-by-account-id.use-case';
import { GetMeUserUseCase } from 'src/application/use-cases/user/get-me-user.use-case';
import { GetFavoritesUserUseCase } from 'src/application/use-cases/user/get-favorites-user.use-case';
import { LoginUserUseCase } from 'src/application/use-cases/user/login-user.use-case';
import { PathUserUseCase } from 'src/application/use-cases/user/path-user.use-case';
import { UpdateStatusUserUseCase } from 'src/application/use-cases/user/update-status-user.use-case';
import { CreateUserMasterDto } from '../dtos/user/create-user-master.dto';
import { CreateUserMasterUseCase } from 'src/application/use-cases/user/create-user-master.use-case';

@ApiTags('v1/users')
@Controller('v1/users')
export class UserController {

    constructor(
        private readonly createFavoriteUserUseCase: CreateFavoriteUserUseCase,
        private readonly deleteFavoriteUserUseCase: DeleteFavoriteUserUseCase,
        private readonly deleteUserUseCase: DeleteUserUseCase,
        private readonly getAllUserByAccountIdUseCase: GetAllUserByAccountIdUseCase,
        private readonly getMeUserUseCase: GetMeUserUseCase,
        private readonly getFavoritesUserUseCase: GetFavoritesUserUseCase,
        private readonly loginUserUseCase: LoginUserUseCase,
        private readonly pathUserUseCase: PathUserUseCase,
        private readonly updateStatusUserUseCase: UpdateStatusUserUseCase,
        private readonly createUserMasterUseCase: CreateUserMasterUseCase,
    ) {}

    /*
    @ApiBearerAuth()
    @Post('user-master-user')
    @Auth()
    async createMaster(@Authenticated() authenticatedUser: AuthenticatedUser, @Body() createUserMasterDto: CreateUserMasterDto): Promise<void> {
        await this.createUserMasterUseCase.execute({ name: createUserMasterDto.name, email: authenticatedUser.email, uid: authenticatedUser.uid });
    }
    */

    @ApiBearerAuth()
    @Get()
    @Auth('ADMIN')
    async getAll(@Authenticated() authenticatedUser: AuthenticatedUser): Promise<User[]> {
        return this.getAllUserByAccountIdUseCase.execute({
            accountId: authenticatedUser.accountId
        });
    }

    @ApiBearerAuth()
    @Get('me')
    @Auth()
    async get(@Authenticated() authenticatedUser: AuthenticatedUser): Promise<User> {
        return this.getMeUserUseCase.execute({
            uid: authenticatedUser.uid
        });
    }

    @Post('login')
    // TODO: remover?, este endpoint é apenas para testes
    async login(@Body() loginDto: LoginDto) {
        return this.loginUserUseCase.execute({
            email: loginDto.email,
            password: loginDto.password
        });
    }

    @ApiBearerAuth()
    @Post('favorites')
    @Auth('ADMIN', 'USER')
    async createFavorite(@Authenticated() authenticatedUser: AuthenticatedUser, @Body() createFavoriteAdvertisementDto: CreateFavoriteAdvertisementDto): Promise<User> {
        const response = await this.createFavoriteUserUseCase.execute({
            userId: authenticatedUser.userId,
            advertisementId: createFavoriteAdvertisementDto.id
        });
        return response;
    }

    @ApiBearerAuth()
    @Get('favorites')
    @Auth('ADMIN', 'USER')
    async getFavorites(@Authenticated() authenticatedUser: AuthenticatedUser): Promise<any[]> {
        return this.getFavoritesUserUseCase.execute({
            userId: authenticatedUser.userId
        });
    }

    @ApiBearerAuth()
    @Delete('favorites/:advertisementid')
    @Auth('ADMIN', 'USER')
    async deleteFavorite(@Authenticated() authenticatedUser: AuthenticatedUser, @Param('advertisementid') advertisementId: string): Promise<void> {
        await this.deleteFavoriteUserUseCase.execute({
            userId: authenticatedUser.userId,
            advertisementId
        });
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
        
        await this.pathUserUseCase.execute({
            userRole: authenticatedUser.userRole,
            accountId: authenticatedUser.accountId,
            userId,
            name: patchUserDto.name,
            phone: patchUserDto.phone,
            whatsApp: patchUserDto.whatsApp
        });
    }

    @ApiBearerAuth()
    @Put(':userid/status')
    @Auth('MASTER', 'ADMIN')
    async updateStatus(@Authenticated() authenticatedUser: AuthenticatedUser, @Param('userid') userId: string, @Body() updateStatusUserDto: UpdateStatusUserDto): Promise<void> {
        if(userId === authenticatedUser.userId) throw new Error('Unauthorized');

        await this.updateStatusUserUseCase.execute({
            userRole: authenticatedUser.userRole,
            accountId: authenticatedUser.accountId,
            userId,
            status: updateStatusUserDto.status
        });
    }

    @ApiBearerAuth()
    @Delete(':userid')
    @Auth('ADMIN')
    async delete(@Authenticated() authenticatedUser: AuthenticatedUser, @Param('userid') userId: string): Promise<void> {
        if(userId === authenticatedUser.userId) throw new Error('Unauthorized');
        
        await this.deleteUserUseCase.execute({
            userRole: authenticatedUser.userRole,
            accountId: authenticatedUser.accountId,
            userId
        });
    }
}
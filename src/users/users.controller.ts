import { Body, Controller, Delete, FileTypeValidator, Get, MaxFileSizeValidator, Param, ParseFilePipe, Patch, Post, Put, UnauthorizedException, UploadedFile, UseInterceptors } from '@nestjs/common';
import { diskStorage } from 'multer';
import { UsersService } from './users.service';
import { Auth } from 'src/decorators/auth.decorator';
import { Authenticated } from 'src/decorators/authenticated.decorator';
import { User, UserRole } from './interfaces/user.interface';
import { AuthenticatedUser } from './interfaces/authenticated-user.interface';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { LoginDto } from './dtos/login-dto';
import { PatchUserDto } from './dtos/patch-user.dto';
import { UpdateStatusUserDto } from './dtos/update-status-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { editFileName, imageFileFilter } from 'src/utils/file-upload.utils';

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
    @Auth('MASTER', 'ADMIN', 'USER')
    async get(@Authenticated() authenticatedUser: AuthenticatedUser): Promise<User> {
        return this.usersService.getByUid(authenticatedUser.uid);
    }

    @Post('login')
    // TODO: remover?, este endpoint é apenas para testes
    async login(@Body() loginDto: LoginDto) {
        return this.usersService.login(loginDto.email, loginDto.password);
    }

    @ApiBearerAuth()
    @Delete('me')
    @Auth('MASTER', 'ADMIN', 'USER')
    // TODO: remover ou trocar, este endpoint é apenas para testes
    async deleteMe(@Authenticated() authenticatedUser: AuthenticatedUser): Promise<void> {
        await this.usersService.deleteMe(authenticatedUser.uid);
    }

    @ApiBearerAuth()
    @Patch(':userid')
    @Auth('MASTER', 'ADMIN', 'USER')
    async patch(@Authenticated() authenticatedUser: AuthenticatedUser, @Param('userid') userId: string, @Body() patchUserDto: PatchUserDto): Promise<void> {
        if(authenticatedUser.userRole === UserRole.USER && userId !== authenticatedUser.userId) throw new Error('Unauthorized');
        
        await this.usersService.patch(authenticatedUser, userId, patchUserDto);
    }

    @ApiBearerAuth()
    @Put(':userid/status')
    @Auth('MASTER', 'ADMIN')
    async updateStatus(@Authenticated() authenticatedUser: AuthenticatedUser, @Param('userid') userId: string, @Body() updateStatusUserDto: UpdateStatusUserDto): Promise<void> {
        if(userId === authenticatedUser.userId) throw new Error('Unauthorized');

        await this.usersService.updateStatus(authenticatedUser, userId, updateStatusUserDto);
    }

    @ApiBearerAuth()
    @Delete(':userid')
    @Auth('ADMIN')
    async delete(@Authenticated() authenticatedUser: AuthenticatedUser, @Param('userid') userId: string): Promise<void> {
        if(userId === authenticatedUser.userId) throw new Error('Unauthorized');
        
        await this.usersService.delete(authenticatedUser, userId);
    }

    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @Post('me/images')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
          destination: './uploads',
          filename: editFileName,
        }),
        fileFilter: imageFileFilter,
        limits: { fileSize: 1 * 1024 * 1024 }, // 5MB limit
      }))
    @Auth('ADMIN', 'USER')
    async uploadImage(
        @Authenticated() authenticatedUser: AuthenticatedUser,
        @UploadedFile(
            new ParseFilePipe({ 
                validators: [
                    new MaxFileSizeValidator({ maxSize: 1000000 }), 
                    new FileTypeValidator({ fileType: 'image/jpeg' })
                ] 
            }
        )
    ) file: Express.Multer.File): Promise<void> {
        await this.usersService.updloadImage(authenticatedUser, file.filename, file.path);
    }

    @ApiBearerAuth()
    @Delete('me/images')
    @Auth('ADMIN', 'USER')
    async deleteImage(@Authenticated() authenticatedUser: AuthenticatedUser): Promise<void> {
        await this.usersService.deleteImage(authenticatedUser);
    }
}

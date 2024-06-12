import { Body, Controller, Delete, FileTypeValidator, Get, MaxFileSizeValidator, Param, ParseFilePipe, Post, Put, UploadedFile, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AdvertisementsService, editFileName, imageFileFilter } from './advertisements.service';
import { Authenticated } from 'src/decorators/authenticated.decorator';
import { AuthenticatedUser } from 'src/users/interfaces/authenticated-user.interface';
import { Auth } from 'src/decorators/auth.decorator';
import { CreateUpdateAdvertisementDto } from './dtos/create-update-advertisement.dto';
import { Advertisement } from './interfaces/advertisement.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UpdateImageOrderAdvertisementDto } from './dtos/update-image-order-advertisement.dto';
import { UpdateStatusAdvertisementDto } from './dtos/update-status-advertisement.dto';

@ApiTags('v1/advertisements')
@Controller('v1/advertisements')
export class AdvertisementsController {

    constructor(
        private readonly advertisementsService: AdvertisementsService,
    ) {}

    @ApiBearerAuth()
    @Post()
    @Auth('ADMIN', 'USER')
    @UsePipes(new ValidationPipe({transform: true}))
    async create(@Authenticated() authenticatedUser: AuthenticatedUser, @Body() createUpdateAdvertisementDto: CreateUpdateAdvertisementDto): Promise<void> {
        return this.advertisementsService.create(
            authenticatedUser,
            createUpdateAdvertisementDto,
        );
    }

    @ApiBearerAuth()
    @Get()
    @Auth('ADMIN', 'USER')
    async getAll(@Authenticated() authenticatedUser: AuthenticatedUser): Promise<Advertisement[]> {
        return this.advertisementsService.getAllByAccountId(authenticatedUser.accountId);
    }

    @ApiBearerAuth()
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
          type: 'object',
          properties: {
            order: { type: 'integer' },
            file: {
              type: 'string',
              format: 'binary',
            },
          },
        },
      })
    @Post(':advertisementid/images')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
          destination: './uploads',
          filename: editFileName,
        }),
        fileFilter: imageFileFilter,
        limits: { fileSize: 1 * 1024 * 1024 }, // 5MB limit
      }))
    @Auth('ADMIN', 'USER')
    async upload(
        @Authenticated() authenticatedUser: AuthenticatedUser,
        @Param('advertisementid') advertisementid: string,
        @UploadedFile(
            new ParseFilePipe({ 
                validators: [
                    new MaxFileSizeValidator({ maxSize: 1000000 }), 
                    new FileTypeValidator({ fileType: 'image/jpeg' })
                ] 
            }
        )
    ) file: Express.Multer.File, @Body('order') order: number): Promise<void> {
        await this.advertisementsService.updloadImage(authenticatedUser.accountId, advertisementid, file.filename, file.path, +order);
    }

    @ApiBearerAuth()
    @Delete(':advertisementid/images/:imageid')
    @Auth('ADMIN', 'USER')
    async deleteImage(@Authenticated() authenticatedUser: AuthenticatedUser, @Param('advertisementid') advertisementid: string, @Param('imageid') imageid: string): Promise<void> {
        await this.advertisementsService.deleteImage(authenticatedUser.accountId, advertisementid, imageid);
    }

    @ApiBearerAuth()
    @ApiBody({ type: [UpdateImageOrderAdvertisementDto] })
    @Put(':advertisementid/images')
    @Auth('ADMIN', 'USER')
    @UsePipes(new ValidationPipe({transform: true}))
    async updateImageOrders(@Authenticated() authenticatedUser: AuthenticatedUser, @Param('advertisementid') advertisementid: string, @Body() updateImagesOrdersAdvertisementDto: UpdateImageOrderAdvertisementDto[]): Promise<void> {
        await this.advertisementsService.updateImageOrders(authenticatedUser.accountId, advertisementid, updateImagesOrdersAdvertisementDto);
    }

    @ApiBearerAuth()
    @Put(':advertisementid')
    @Auth('ADMIN', 'USER')
    @UsePipes(new ValidationPipe({transform: true}))
    async update(@Authenticated() authenticatedUser: AuthenticatedUser, @Param('advertisementid') advertisementid: string, @Body() createUpdateAdvertisementDto: CreateUpdateAdvertisementDto): Promise<void> {
        await this.advertisementsService.update(
            authenticatedUser,
            advertisementid,
            createUpdateAdvertisementDto,
        );
    }

    @ApiBearerAuth()
    @Get('toapprove')
    @Auth('MASTER')
    async getAllToApprove(): Promise<Advertisement[]> {
        return this.advertisementsService.getAllToApprove();
    }

    @ApiBearerAuth()
    @Put(':advertisementid/status')
    @Auth('ADMIN', 'USER')
    @UsePipes(new ValidationPipe({ transform: true }))
    async updateStatus(@Authenticated() authenticatedUser: AuthenticatedUser, @Param('advertisementid') advertisementid: string, @Body() updateStatusAdvertisementDto: UpdateStatusAdvertisementDto): Promise<void> {
        await this.advertisementsService.updateStatus(
            authenticatedUser,
            advertisementid,
            updateStatusAdvertisementDto,
        );
    }
}
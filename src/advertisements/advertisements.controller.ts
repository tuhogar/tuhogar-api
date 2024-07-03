import { Body, Controller, Delete, FileTypeValidator, Get, MaxFileSizeValidator, Param, ParseFilePipe, Post, Put, Query, UploadedFile, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { AdvertisementsService } from './advertisements.service';
import { Authenticated } from 'src/decorators/authenticated.decorator';
import { AuthenticatedUser } from 'src/users/interfaces/authenticated-user.interface';
import { Auth } from 'src/decorators/auth.decorator';
import { CreateUpdateAdvertisementDto } from './dtos/create-update-advertisement.dto';
import { Advertisement } from './interfaces/advertisement.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UpdateImageOrderAdvertisementDto } from './dtos/update-image-order-advertisement.dto';
import { UpdateStatusAdvertisementDto } from './dtos/update-status-advertisement.dto';
import { GetActivesAdvertisementDto } from './dtos/get-actives-advertisement.dto';
import { editFileName, imageFileFilter } from 'src/utils/file-upload.utils';
import { UploadImagesAdvertisementDto } from './dtos/upload-images-advertisement.dto';
import { UpdateStatusAllAdvertisementsDto } from './dtos/update-status-all-advertisement.dto';

@ApiTags('v1/advertisements')
@Controller('v1/advertisements')
export class AdvertisementsController {

    constructor(
        private readonly advertisementsService: AdvertisementsService,
    ) {}

    @ApiBearerAuth()
    @Post()
    @Auth('MASTER', 'ADMIN', 'USER')//@Auth('ADMIN', 'USER')
    @UsePipes(new ValidationPipe({transform: true}))
    async create(@Authenticated() authenticatedUser: AuthenticatedUser, @Body() createUpdateAdvertisementDto: CreateUpdateAdvertisementDto): Promise<void> {
        return this.advertisementsService.create(
            authenticatedUser,
            createUpdateAdvertisementDto,
        );
    }

    @ApiBearerAuth()
    @Get()
    @Auth('MASTER', 'ADMIN', 'USER')//@Auth('ADMIN', 'USER')
    async getAll(@Authenticated() authenticatedUser: AuthenticatedUser): Promise<Advertisement[]> {
        return this.advertisementsService.getAllByAccountId(authenticatedUser.accountId);
    }

    @ApiBearerAuth()
    @Get('toapprove')
    @Auth('MASTER', 'ADMIN', 'USER')//@Auth('MASTER')
    async getAllToApprove(): Promise<Advertisement[]> {
        return this.advertisementsService.getAllToApprove();
    }

    @Post('bulk')
    @Auth('MASTER', 'ADMIN', 'USER')//@Auth('MASTER')
    async bulk(): Promise<void> {
        await this.advertisementsService.bulk();
    }

    @Get('actives')
    async getActives(@Query(new ValidationPipe({ transform: true })) getActivesAdvertisementDto: GetActivesAdvertisementDto): Promise<any> {
        return this.advertisementsService.getActives(getActivesAdvertisementDto);
    }

    @ApiBearerAuth()
    @Put('status')
    @Auth('MASTER', 'ADMIN', 'USER')//@Auth('MASTER')
    @UsePipes(new ValidationPipe({ transform: true }))
    async updateStatusActiveOrInactive(@Authenticated() authenticatedUser: AuthenticatedUser, @Body() updateStatusAllAdvertisementsDto: UpdateStatusAllAdvertisementsDto): Promise<void> {
        await this.advertisementsService.updateStatusAll(
            authenticatedUser.userId,
            updateStatusAllAdvertisementsDto,
        );
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
    @Post(':advertisementid/upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
          destination: './uploads',
          filename: editFileName,
        }),
        fileFilter: imageFileFilter,
        limits: { fileSize: 1 * 1024 * 1024 }, // 5MB limit
      }))
    @Auth('MASTER', 'ADMIN', 'USER')//@Auth('ADMIN', 'USER')
    async uploadImage(
        @Authenticated() authenticatedUser: AuthenticatedUser,
        @Param('advertisementid') advertisementId: string,
        @UploadedFile(
            new ParseFilePipe({ 
                validators: [
                    new MaxFileSizeValidator({ maxSize: 1000000 }), 
                    new FileTypeValidator({ fileType: 'image/jpeg' })
                ] 
            }
        )
    ) file: Express.Multer.File, @Body('order') order: number): Promise<void> {
        await this.advertisementsService.updloadImage(authenticatedUser.accountId, advertisementId, file.filename, file.path, +order);
    }

    @ApiBearerAuth()
    @Post(':advertisementid/images')
    @Auth('MASTER', 'ADMIN', 'USER')//@Auth('ADMIN', 'USER')
    @UsePipes(new ValidationPipe({transform: true}))
    async upload(
        @Authenticated() authenticatedUser: AuthenticatedUser,
        @Param('advertisementid') advertisementId: string,
        @Body() uploadImagesAdvertisementDto: UploadImagesAdvertisementDto): Promise<void> {
        await this.advertisementsService.processImages(authenticatedUser.accountId, advertisementId, uploadImagesAdvertisementDto);
    }

    @ApiBearerAuth()
    @Delete(':advertisementid/images/:imageid')
    @Auth('MASTER', 'ADMIN', 'USER')//@Auth('ADMIN', 'USER')
    // TODO: este endpoint não vai mais existir? existirá somente o endpoint que faz o upload recebendo um array?
    // Como faremos para excluir uma imagem de um anúncio?
    async deleteImage(@Authenticated() authenticatedUser: AuthenticatedUser, @Param('advertisementid') advertisementId: string, @Param('imageid') imageid: string): Promise<void> {
        await this.advertisementsService.deleteImage(authenticatedUser, advertisementId, imageid);
    }

    @ApiBearerAuth()
    @ApiBody({ type: [UpdateImageOrderAdvertisementDto] })
    @Put(':advertisementid/images')
    @Auth('MASTER', 'ADMIN', 'USER')//@Auth('ADMIN', 'USER')
    @UsePipes(new ValidationPipe({transform: true}))
    async updateImageOrders(@Authenticated() authenticatedUser: AuthenticatedUser, @Param('advertisementid') advertisementId: string, @Body() updateImagesOrdersAdvertisementDto: UpdateImageOrderAdvertisementDto[]): Promise<void> {
        await this.advertisementsService.updateImageOrders(authenticatedUser, advertisementId, updateImagesOrdersAdvertisementDto);
    }

    @ApiBearerAuth()
    @Put(':advertisementid')
    @Auth('MASTER', 'ADMIN', 'USER')//@Auth('ADMIN', 'USER')
    @UsePipes(new ValidationPipe({transform: true}))
    async update(@Authenticated() authenticatedUser: AuthenticatedUser, @Param('advertisementid') advertisementId: string, @Body() createUpdateAdvertisementDto: CreateUpdateAdvertisementDto): Promise<void> {
        await this.advertisementsService.update(
            authenticatedUser,
            advertisementId,
            createUpdateAdvertisementDto,
        );
    }

    @ApiBearerAuth()
    @Put(':advertisementid/status')
    @Auth('MASTER', 'ADMIN', 'USER')//@Auth('MASTER', 'ADMIN', 'USER')
    @UsePipes(new ValidationPipe({ transform: true }))
    async updateStatus(@Authenticated() authenticatedUser: AuthenticatedUser, @Param('advertisementid') advertisementId: string, @Body() updateStatusAdvertisementDto: UpdateStatusAdvertisementDto): Promise<void> {
        await this.advertisementsService.updateStatus(
            authenticatedUser,
            advertisementId,
            updateStatusAdvertisementDto,
        );
    }

    @ApiBearerAuth()
    @Get(':advertisementid')
    @Auth('MASTER', 'ADMIN', 'USER')//@Auth('MASTER', 'ADMIN', 'USER')
    @UsePipes(new ValidationPipe({transform: true}))
    async get(@Authenticated() authenticatedUser: AuthenticatedUser, @Param('advertisementid') advertisementId: string): Promise<Advertisement> {
        return this.advertisementsService.getByAccountIdAndId(
            authenticatedUser,
            advertisementId,
        );
    }
}
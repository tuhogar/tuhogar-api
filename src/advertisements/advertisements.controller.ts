import { BadRequestException, Body, Controller, Delete, FileTypeValidator, Get, MaxFileSizeValidator, Param, ParseFilePipe, Post, Put, UploadedFile, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { AdvertisementsService, editFileName, imageFileFilter } from './advertisements.service';
import { Authenticated } from 'src/decorators/authenticated.decorator';
import { AuthenticatedUser } from 'src/users/interfaces/authenticated-user.interface';
import { Auth } from 'src/decorators/auth.decorator';
import { CreateAdvertisementDto } from './dtos/create-advertisement.dto';
import { Advertisement, AdvertisementPropertyStatus, AdvertisementPropertyType, AdvertisementStatus, AdvertisementTransactionType } from './interfaces/advertisement.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UpdateImageOrderAdvertisementDto } from './dtos/update-image-order-advertisement.dto';

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
    async create(@Authenticated() authenticatedUser: AuthenticatedUser, @Body() createAdvertisementsDto: CreateAdvertisementDto): Promise<void> {
        return this.advertisementsService.create(
            authenticatedUser.accountId,
            authenticatedUser.userId,
            createAdvertisementsDto.description,
            createAdvertisementsDto.transactionType,
            createAdvertisementsDto.propertyStatus,
            createAdvertisementsDto.propertyType,
            createAdvertisementsDto.allContentsIncluded,
            createAdvertisementsDto.isResidentialComplex,
            createAdvertisementsDto.isPenthouse,
            createAdvertisementsDto.bedsCount,
            createAdvertisementsDto.bathsCount,
            createAdvertisementsDto.parkingCount,
            createAdvertisementsDto.floorsCount,
            createAdvertisementsDto.constructionYear,
            createAdvertisementsDto.socioEconomicLevel,
            createAdvertisementsDto.isHoaIncluded,
            createAdvertisementsDto.amenities,
            createAdvertisementsDto.hoaFee,
            createAdvertisementsDto.lotArea,
            createAdvertisementsDto.floorArea,
            createAdvertisementsDto.price,
            createAdvertisementsDto.pricePerFloorArea,
            createAdvertisementsDto.pricePerLotArea,
            createAdvertisementsDto.address,
            createAdvertisementsDto.tourUrl,
            createAdvertisementsDto.videoUrl,
            createAdvertisementsDto.isActive,
            createAdvertisementsDto.isPaid,
        );
    }

    @ApiBearerAuth()
    @Get()
    @Auth('ADMIN', 'USER')
    async getAll(@Authenticated() authenticatedUser: AuthenticatedUser): Promise<Advertisement[]> {
        return this.advertisementsService.getAllByAccountId(authenticatedUser.accountId);
    }

    @ApiBearerAuth()
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
        await this.advertisementsService.updloadImage(advertisementid, file.filename, file.path, +order);
    }

    @ApiBearerAuth()
    @Delete(':advertisementid/images/:imageid')
    @Auth('ADMIN', 'USER')
    async deleteImage(@Param('advertisementid') advertisementid: string, @Param('imageid') imageid: string): Promise<void> {
        await this.advertisementsService.deleteImage(advertisementid, imageid);
    }

    @ApiBearerAuth()
    @ApiBody({ type: [UpdateImageOrderAdvertisementDto] })
    @Put(':advertisementid/images')
    @Auth('ADMIN', 'USER')
    @UsePipes(new ValidationPipe({transform: true}))
    async updateImageOrders(@Param('advertisementid') advertisementid: string, @Body() updateImagesOrdersAdvertisementDto: UpdateImageOrderAdvertisementDto[]): Promise<void> {
        await this.advertisementsService.updateImageOrders(advertisementid, updateImagesOrdersAdvertisementDto);
    }
}
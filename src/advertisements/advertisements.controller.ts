import { Body, Controller, Get, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { AdvertisementsService } from './advertisements.service';
import { Authenticated } from 'src/decorators/authenticated.decorator';
import { AuthenticatedUser } from 'src/users/interfaces/authenticated-user.interface';
import { Auth } from 'src/decorators/auth.decorator';
import { CreateAdvertisementDto } from './dtos/create-advertisement.dto';
import { Advertisement, AdvertisementPropertyStatus, AdvertisementPropertyType, AdvertisementStatus, AdvertisementTransactionType } from './interfaces/advertisement.interface';
import { validate } from 'class-validator';

@Controller('v1/advertisements')
export class AdvertisementsController {

    constructor(
        private readonly advertisementsService: AdvertisementsService,
    ) {}

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

    @Get()
    @Auth('ADMIN', 'USER')
    async getAll(@Authenticated() authenticatedUser: AuthenticatedUser): Promise<Advertisement[]> {
        return this.advertisementsService.getAllByAccountId(authenticatedUser.accountId);
    }
}

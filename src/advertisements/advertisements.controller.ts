import { Body, Controller, Get, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { AdvertisementsService } from './advertisements.service';
import { Authenticated } from 'src/decorators/authenticated.decorator';
import { AuthenticatedUser } from 'src/users/interfaces/authenticated-user.interface';
import { Auth } from 'src/decorators/auth.decorator';
import { CreateAdvertisementDto } from './dtos/create-advertisement.dto';
import { Advertisement, AdvertisementStatus } from './interfaces/advertisement.interface';

@Controller('v1/advertisements')
export class AdvertisementsController {

    constructor(
        private readonly advertisementsService: AdvertisementsService,
    ) {}

    @Post()
    @Auth('ADMIN', 'USER')
    @UsePipes(new ValidationPipe({transform: true}))
    async create(@Authenticated() authenticatedUser: AuthenticatedUser, @Body() createAdvertisementsDto: CreateAdvertisementDto): Promise<void> {
        return this.advertisementsService.create(authenticatedUser.accountId, authenticatedUser.userId, createAdvertisementsDto.description);
    }

    @Get()
    @Auth('ADMIN', 'USER')
    async getAll(@Authenticated() authenticatedUser: AuthenticatedUser): Promise<Advertisement[]> {
        return this.advertisementsService.getAllByAccountId(authenticatedUser.accountId);
    }
}

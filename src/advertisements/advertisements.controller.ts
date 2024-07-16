import { Body, Controller, Delete, Get, Param, Post, Put, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdvertisementsService } from './advertisements.service';
import { Authenticated } from 'src/decorators/authenticated.decorator';
import { AuthenticatedUser } from 'src/users/interfaces/authenticated-user.interface';
import { Auth } from 'src/decorators/auth.decorator';
import { CreateUpdateAdvertisementDto } from './dtos/create-update-advertisement.dto';
import { Advertisement } from './interfaces/advertisement.interface';
import { UpdateStatusAdvertisementDto } from './dtos/update-status-advertisement.dto';
import { GetActivesAdvertisementDto } from './dtos/get-actives-advertisement.dto';
import { UploadImagesAdvertisementDto } from './dtos/upload-images-advertisement.dto';
import { UpdateStatusAllAdvertisementsDto } from './dtos/update-status-all-advertisement.dto';
import { DeleteImagesAdvertisementDto } from './dtos/delete-images-advertisement.dto';
import { DeleteAdvertisementsDto } from './dtos/delete-advertisements.dto';
import { SlugifyPipe } from './pipes/slugify-pipe';

@ApiTags('v1/advertisements')
@Controller('v1/advertisements')
export class AdvertisementsController {

    constructor(
        private readonly advertisementsService: AdvertisementsService,
    ) {}

    @ApiBearerAuth()
    @Post()
    @Auth('ADMIN', 'USER')
    @UsePipes(SlugifyPipe)
    @UsePipes(new ValidationPipe({transform: true}))
    async create(@Authenticated() authenticatedUser: AuthenticatedUser, @Body() createUpdateAdvertisementDto: CreateUpdateAdvertisementDto): Promise<{ id: string }> {
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
    @Get('registrations')
    @Auth('MASTER')
    async getAdvertisementRegistrations(@Query('period') period: 'week' | 'month'): Promise<any[]> {
        return this.advertisementsService.getAdvertisementRegistrations(period);
    }

    @ApiBearerAuth()
    @Get('toapprove')
    @Auth('MASTER')
    async getAllToApprove(): Promise<Advertisement[]> {
        return this.advertisementsService.getAllToApprove();
    }

    @Post('bulk')
    @Auth('MASTER')
    async bulk(): Promise<void> {
        await this.advertisementsService.bulk();
    }

    @Get('actives')
    async getActives(@Query(new ValidationPipe({ transform: true })) getActivesAdvertisementDto: GetActivesAdvertisementDto): Promise<any> {
        return this.advertisementsService.getActives(getActivesAdvertisementDto);
    }

    @ApiBearerAuth()
    @Put('status')
    @Auth('MASTER')
    @UsePipes(new ValidationPipe({ transform: true }))
    async updateStatusActiveOrInactive(@Authenticated() authenticatedUser: AuthenticatedUser, @Body() updateStatusAllAdvertisementsDto: UpdateStatusAllAdvertisementsDto): Promise<void> {
        await this.advertisementsService.updateStatusAll(
            authenticatedUser.userId,
            updateStatusAllAdvertisementsDto,
        );
    }

    @ApiBearerAuth()
    @Post(':advertisementid/images')
    @Auth('ADMIN', 'USER')
    @UsePipes(new ValidationPipe({transform: true}))
    async uploadImages(
        @Authenticated() authenticatedUser: AuthenticatedUser,
        @Param('advertisementid') advertisementId: string,
        @Body() uploadImagesAdvertisementDto: UploadImagesAdvertisementDto): Promise<void> {
        await this.advertisementsService.processImages(authenticatedUser.accountId, advertisementId, uploadImagesAdvertisementDto);
    }

    @ApiBearerAuth()
    @Delete(':advertisementid/images')
    @Auth('ADMIN', 'USER')
    async deleteImages(
        @Authenticated() authenticatedUser: AuthenticatedUser,
        @Param('advertisementid') advertisementId: string,
        @Body() deleteImagesAdvertisementDto: DeleteImagesAdvertisementDto): Promise<void> {
        await this.advertisementsService.deleteImages(authenticatedUser, advertisementId, deleteImagesAdvertisementDto);
    }

    @ApiBearerAuth()
    @Put(':advertisementid')
    @Auth('ADMIN', 'USER')
    @UsePipes(SlugifyPipe)
    @UsePipes(new ValidationPipe({transform: true}))
    async update(@Authenticated() authenticatedUser: AuthenticatedUser, @Param('advertisementid') advertisementId: string, @Body() createUpdateAdvertisementDto: CreateUpdateAdvertisementDto): Promise<{ id: string }> {
        return await this.advertisementsService.update(
            authenticatedUser,
            advertisementId,
            createUpdateAdvertisementDto,
        );
    }

    @ApiBearerAuth()
    @Put(':advertisementid/status')
    @Auth('MASTER', 'ADMIN', 'USER')
    @UsePipes(new ValidationPipe({ transform: true }))
    async updateStatus(@Authenticated() authenticatedUser: AuthenticatedUser, @Param('advertisementid') advertisementId: string, @Body() updateStatusAdvertisementDto: UpdateStatusAdvertisementDto): Promise<{ id: string }> {
        return await this.advertisementsService.updateStatus(
            authenticatedUser,
            advertisementId,
            updateStatusAdvertisementDto,
        );
    }

    @ApiBearerAuth()
    @Get(':advertisementid')
    @UsePipes(new ValidationPipe({transform: true}))
    async get(@Param('advertisementid') advertisementId: string): Promise<Advertisement> {
        return this.advertisementsService.get(advertisementId);
    }

    @ApiBearerAuth()
    @Delete()
    @Auth('MASTER')
    async deleteAll(@Body() deleteAdvertisementsDto: DeleteAdvertisementsDto ): Promise<void> {
        await this.advertisementsService.deleteAll(deleteAdvertisementsDto);
    }
}
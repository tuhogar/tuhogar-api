import { Body, Controller, Delete, Get, Param, Post, Put, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdvertisementService } from 'src/application/use-cases/advertisement/advertisement.service';
import { Authenticated } from '../../decorators/authenticated.decorator';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user.interface';
import { Auth } from 'src/infraestructure/decorators/auth.decorator';
import { CreateUpdateAdvertisementDto } from '../dtos/advertisement/create-update-advertisement.dto';
import { Advertisement } from '../../../domain/entities/advertisement.interface';
import { UpdateStatusAdvertisementDto } from '../dtos/advertisement/update-status-advertisement.dto';
import { GetActivesAdvertisementDto } from '../dtos/advertisement/get-actives-advertisement.dto';
import { UploadImagesAdvertisementDto } from '../dtos/advertisement/upload-images-advertisement.dto';
import { UpdateStatusAllAdvertisementsDto } from '../dtos/advertisement/update-status-all-advertisement.dto';
import { DeleteImagesAdvertisementDto } from '../dtos/advertisement/delete-images-advertisement.dto';
import { DeleteAdvertisementsDto } from '../dtos/advertisement/delete-advertisements.dto';
import { SlugifyPipe } from 'src/infraestructure/http/pipes/slugify-pipe';

@ApiTags('v1/advertisements')
@Controller('v1/advertisements')
export class AdvertisementController {

    constructor(
        private readonly advertisementService: AdvertisementService,
    ) {}

    @ApiBearerAuth()
    @Post()
    @Auth('ADMIN', 'USER')
    @UsePipes(SlugifyPipe)
    @UsePipes(new ValidationPipe({transform: true}))
    async create(@Authenticated() authenticatedUser: AuthenticatedUser, @Body() createUpdateAdvertisementDto: CreateUpdateAdvertisementDto): Promise<{ id: string }> {
        return this.advertisementService.create(
            authenticatedUser,
            createUpdateAdvertisementDto,
        );
    }

    @ApiBearerAuth()
    @Get()
    @Auth('ADMIN', 'USER')
    async getAll(@Authenticated() authenticatedUser: AuthenticatedUser): Promise<Advertisement[]> {
        return this.advertisementService.getAllByAccountId(authenticatedUser.accountId);
    }

    @ApiBearerAuth()
    @Get('registrations')
    @Auth('MASTER')
    async getAdvertisementRegistrations(@Query('period') period: 'week' | 'month'): Promise<any[]> {
        return this.advertisementService.getAdvertisementRegistrations(period);
    }

    @ApiBearerAuth()
    @Get('toapprove')
    @Auth('MASTER')
    async getAllToApprove(): Promise<Advertisement[]> {
        return this.advertisementService.getAllToApprove();
    }

    @Post('bulk')
    @Auth('MASTER')
    async bulk(): Promise<void> {
        await this.advertisementService.bulk();
    }

    @Get('actives')
    async getActives(@Query(new ValidationPipe({ transform: true })) getActivesAdvertisementDto: GetActivesAdvertisementDto): Promise<any> {
        return this.advertisementService.getActives(getActivesAdvertisementDto);
    }

    @ApiBearerAuth()
    @Get('actives/:advertisementid')
    @UsePipes(new ValidationPipe({transform: true}))
    async getActive(@Param('advertisementid') advertisementId: string): Promise<Advertisement> {
        return this.advertisementService.getActive(advertisementId);
    }

    @ApiBearerAuth()
    @Put('status')
    @Auth('MASTER', 'ADMIN', 'USER')
    @UsePipes(new ValidationPipe({ transform: true }))
    async updateStatusAll(@Authenticated() authenticatedUser: AuthenticatedUser, @Body() updateStatusAllAdvertisementsDto: UpdateStatusAllAdvertisementsDto): Promise<void> {
        await this.advertisementService.updateStatusAll(
            authenticatedUser,
            updateStatusAllAdvertisementsDto,
        );
    }

    @Get('find-similar')
    async findSimilarDocuments(@Query('query') query: string) {
        return this.advertisementService.findSimilarDocuments(query);
    }

    @ApiBearerAuth()
    @Get(':advertisementid')
    @Auth('MASTER', 'ADMIN', 'USER')
    @UsePipes(new ValidationPipe({transform: true}))
    async get(@Authenticated() authenticatedUser: AuthenticatedUser,@Param('advertisementid') advertisementId: string): Promise<Advertisement> {
        return this.advertisementService.getByAccountIdAndId(authenticatedUser, advertisementId);
    }

    @ApiBearerAuth()
    @Post(':advertisementid/images')
    @Auth('ADMIN', 'USER')
    @UsePipes(new ValidationPipe({transform: true}))
    async uploadImages(
        @Authenticated() authenticatedUser: AuthenticatedUser,
        @Param('advertisementid') advertisementId: string,
        @Body() uploadImagesAdvertisementDto: UploadImagesAdvertisementDto): Promise<void> {
        await this.advertisementService.processImages(authenticatedUser.accountId, advertisementId, uploadImagesAdvertisementDto);
    }

    @ApiBearerAuth()
    @Delete(':advertisementid/images')
    @Auth('ADMIN', 'USER')
    async deleteImages(
        @Authenticated() authenticatedUser: AuthenticatedUser,
        @Param('advertisementid') advertisementId: string,
        @Body() deleteImagesAdvertisementDto: DeleteImagesAdvertisementDto): Promise<void> {
        await this.advertisementService.deleteImages(authenticatedUser, advertisementId, deleteImagesAdvertisementDto);
    }

    @ApiBearerAuth()
    @Put(':advertisementid')
    @Auth('ADMIN', 'USER')
    @UsePipes(SlugifyPipe)
    @UsePipes(new ValidationPipe({transform: true}))
    async update(@Authenticated() authenticatedUser: AuthenticatedUser, @Param('advertisementid') advertisementId: string, @Body() createUpdateAdvertisementDto: CreateUpdateAdvertisementDto): Promise<{ id: string }> {
        return await this.advertisementService.update(
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
        return await this.advertisementService.updateStatus(
            authenticatedUser,
            advertisementId,
            updateStatusAdvertisementDto,
        );
    }

    @ApiBearerAuth()
    @Delete()
    @Auth('MASTER', 'ADMIN', 'USER')
    async deleteAll(@Authenticated() authenticatedUser: AuthenticatedUser, @Body() deleteAdvertisementsDto: DeleteAdvertisementsDto ): Promise<void> {
        await this.advertisementService.deleteAll(authenticatedUser, deleteAdvertisementsDto);
    }
}
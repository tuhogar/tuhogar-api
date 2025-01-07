import { Body, Controller, Delete, Get, Param, Post, Put, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Authenticated } from '../../decorators/authenticated.decorator';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user';
import { Auth } from 'src/infraestructure/decorators/auth.decorator';
import { CreateUpdateAdvertisementDto } from '../dtos/advertisement/create-update-advertisement.dto';
import { Advertisement, AdvertisementPhoto } from '../../../domain/entities/advertisement';
import { UpdateStatusAdvertisementDto } from '../dtos/advertisement/update-status-advertisement.dto';
import { GetActivesAdvertisementDto } from '../dtos/advertisement/get-actives-advertisement.dto';
import { UploadImagesAdvertisementDto } from '../dtos/advertisement/upload-images-advertisement.dto';
import { UpdateStatusAllAdvertisementsDto } from '../dtos/advertisement/update-status-all-advertisement.dto';
import { DeleteImagesAdvertisementDto } from '../dtos/advertisement/delete-images-advertisement.dto';
import { DeleteAdvertisementsDto } from '../dtos/advertisement/delete-advertisements.dto';
import { SlugifyPipe } from 'src/infraestructure/http/pipes/slugify-pipe';
import { CreateAdvertisementUseCase } from 'src/application/use-cases/advertisement/create-advertisement.use-case';
import { DeleteAllAdvertisementUseCase } from 'src/application/use-cases/advertisement/delete-all-advertisement.use-case';
import { FindSimilarDocumentsAdvertisementUseCase } from 'src/application/use-cases/advertisement/find-similar-documents-advertisement.use-case';
import { GetActiveAdvertisementUseCase } from 'src/application/use-cases/advertisement/get-active-advertisement.use-case';
import { GetActivesAdvertisementUseCase } from 'src/application/use-cases/advertisement/get-actives-advertisement.use-case';
import { GetAllByAccountIdAdvertisementUseCase } from 'src/application/use-cases/advertisement/get-all-by-account-id-advertisement.use-case';
import { GetAllToApproveAdvertisementUseCase } from 'src/application/use-cases/advertisement/get-all-to-approve-advertisement.use-case';
import { GetByAccountIdAndIdAdvertisementUseCase } from 'src/application/use-cases/advertisement/get-by-account-id-and-id-advertisement.use-case';
import { GetRegisteredAdvertisementsUseCase } from 'src/application/use-cases/advertisement/get-registered-advertisements.use-case';
import { ProcessImagesAdvertisementUseCase } from 'src/application/use-cases/advertisement/process-images-advertisement.use-case';
import { UpdateAdvertisementUseCase } from 'src/application/use-cases/advertisement/update-advertisement.use-case';
import { UpdateStatusAllAdvertisementUseCase } from 'src/application/use-cases/advertisement/update-status-all-advertisement.use-case';
import { DeleteImagesAdvertisementUseCase } from 'src/application/use-cases/advertisement/delete-images-advertisement.use-case';
import { BulkAdvertisementUseCase } from 'src/application/use-cases/advertisement/bulk-advertisement.use-case';
import { UserRole } from 'src/domain/entities/user';
import { GetAdvertisementDto } from '../dtos/advertisement/get-advertisement.dto';
import { UpdateImagesOrderAdvertisementDto } from '../dtos/advertisement/update-images-order-advertisement.dto';
import { UpdateImagesOrderAdvertisementUseCase } from 'src/application/use-cases/advertisement/update-images-order-advertisement.use-case';
import { TransferAdvertisementUseCase } from 'src/application/use-cases/advertisement/transfer-advertisement.use-case';
import { TransferAdvertisementDto } from '../dtos/advertisement/transfer-advertisement.dto';

@ApiTags('v1/advertisements')
@Controller('v1/advertisements')
export class AdvertisementController {

    constructor(
        private readonly bulkAdvertisementUseCase: BulkAdvertisementUseCase,
        private readonly createAdvertisementUseCase: CreateAdvertisementUseCase,
        private readonly deleteAllAdvertisementUseCase: DeleteAllAdvertisementUseCase,
        private readonly deleteImagesAdvertisementUseCase: DeleteImagesAdvertisementUseCase,
        private readonly findSimilarDocumentsAdvertisementUseCase: FindSimilarDocumentsAdvertisementUseCase,
        private readonly getActiveAdvertisementUseCase: GetActiveAdvertisementUseCase,
        private readonly getActivesAdvertisementUseCase: GetActivesAdvertisementUseCase,
        private readonly getAllByAccountIdAdvertisementUseCase: GetAllByAccountIdAdvertisementUseCase,
        private readonly getAllToApproveAdvertisementUseCase: GetAllToApproveAdvertisementUseCase,
        private readonly getByAccountIdAndIdAdvertisementUseCase: GetByAccountIdAndIdAdvertisementUseCase,
        private readonly getRegisteredAdvertisementsUseCase: GetRegisteredAdvertisementsUseCase,
        private readonly processImagesAdvertisementUseCase: ProcessImagesAdvertisementUseCase,
        private readonly updateAdvertisementUseCase: UpdateAdvertisementUseCase,
        private readonly updateStatusAllAdvertisementUseCase: UpdateStatusAllAdvertisementUseCase,
        private readonly updateImagesOrderAdvertisementuseCase: UpdateImagesOrderAdvertisementUseCase,
        private readonly transferAdvertisementUseCase: TransferAdvertisementUseCase,
    ) {}

    @ApiBearerAuth()
    @Post()
    @Auth('ADMIN', 'USER')
    @UsePipes(SlugifyPipe)
    @UsePipes(new ValidationPipe({transform: true}))
    async create(@Authenticated() authenticatedUser: AuthenticatedUser, @Body() createUpdateAdvertisementDto: CreateUpdateAdvertisementDto): Promise<Advertisement> {
        const response = await this.createAdvertisementUseCase.execute(
            authenticatedUser,
            createUpdateAdvertisementDto,
        );
        return response;
    }

    @ApiBearerAuth()
    @Get()
    @Auth('ADMIN', 'USER')
    async getAll(@Authenticated() authenticatedUser: AuthenticatedUser, @Query() getAdvertisementDto: GetAdvertisementDto): Promise<{ data: Advertisement[]; count: number }> {
        return this.getAllByAccountIdAdvertisementUseCase.execute({ accountId: authenticatedUser.accountId, page: getAdvertisementDto.page, limit: getAdvertisementDto.limit, code: getAdvertisementDto.code, transactionType: getAdvertisementDto.transactionType, type: getAdvertisementDto.type, externalId: getAdvertisementDto.externalId });
    }

    @ApiBearerAuth()
    @Get('registrations')
    @Auth('MASTER')
    async getRegisteredAdvertisements(@Query('period') period: 'week' | 'month'): Promise<any[]> {
        return this.getRegisteredAdvertisementsUseCase.execute(period);
    }

    @ApiBearerAuth()
    @Get('toapprove')
    @Auth('MASTER')
    async getAllToApprove(): Promise<Advertisement[]> {
        return this.getAllToApproveAdvertisementUseCase.execute();
    }

    @Post('bulk')
    @Auth('MASTER')
    async bulk(): Promise<void> {
        await this.bulkAdvertisementUseCase.execute({});
    }

    @Get('actives')
    async getActives(@Query(new ValidationPipe({ transform: true })) getActivesAdvertisementDto: GetActivesAdvertisementDto): Promise<{ data: Advertisement[]; count: number }> {
        return this.getActivesAdvertisementUseCase.execute(getActivesAdvertisementDto);
    }

    @ApiBearerAuth()
    @Get('actives/:advertisementid')
    @UsePipes(new ValidationPipe({transform: true}))
    async getActive(@Param('advertisementid') advertisementId: string): Promise<Advertisement> {
        return this.getActiveAdvertisementUseCase.execute(advertisementId);
    }

    @ApiBearerAuth()
    @Put('status')
    @Auth('MASTER', 'ADMIN', 'USER')
    @UsePipes(new ValidationPipe({ transform: true }))
    async updateStatusAll(@Authenticated() authenticatedUser: AuthenticatedUser, @Body() updateStatusAllAdvertisementsDto: UpdateStatusAllAdvertisementsDto): Promise<void> {
        const advertisementIds = updateStatusAllAdvertisementsDto.advertisements.map((a) => a.id);
        
        await this.updateStatusAllAdvertisementUseCase.execute({
            accountId: authenticatedUser.accountId,
            userId: authenticatedUser.userId,
            userRole: authenticatedUser.userRole,
            advertisementIds,
            status: updateStatusAllAdvertisementsDto.status,
        });
    }

    @Post('transfer')
    @Auth('MASTER')
    async transfer(@Authenticated() authenticatedUser: AuthenticatedUser, @Body() transferAdvertisementDto: TransferAdvertisementDto): Promise<void> {
        await this.transferAdvertisementUseCase.execute({ userId: authenticatedUser.userId, accountIdFrom: transferAdvertisementDto.accountIdFrom, accountIdTo: transferAdvertisementDto.accountIdTo });
    }

    @Get('find-similar')
    async findSimilarDocuments(@Query('query') query: string) {
        return this.findSimilarDocumentsAdvertisementUseCase.execute(query);
    }

    @ApiBearerAuth()
    @Get(':advertisementid')
    @Auth('MASTER', 'ADMIN', 'USER')
    @UsePipes(new ValidationPipe({transform: true}))
    async get(@Authenticated() authenticatedUser: AuthenticatedUser,@Param('advertisementid') advertisementId: string): Promise<Advertisement> {
        return this.getByAccountIdAndIdAdvertisementUseCase.execute(authenticatedUser, advertisementId);
    }

    @ApiBearerAuth()
    @Post(':advertisementid/images')
    @Auth('ADMIN', 'USER')
    @UsePipes(new ValidationPipe({transform: true}))
    async uploadImages(
        @Authenticated() authenticatedUser: AuthenticatedUser,
        @Param('advertisementid') advertisementId: string,
        @Body() uploadImagesAdvertisementDto: UploadImagesAdvertisementDto): Promise<{ id: string, order: number }[]> {
        return this.processImagesAdvertisementUseCase.execute(authenticatedUser.accountId, advertisementId, uploadImagesAdvertisementDto);
    }

    @ApiBearerAuth()
    @Put(':advertisementid/images/orders')
    @Auth('ADMIN', 'USER')
    @UsePipes(new ValidationPipe({transform: true}))
    async updateOrderImages(
        @Authenticated() authenticatedUser: AuthenticatedUser,
        @Param('advertisementid') advertisementId: string,
        @Body() updateImagesOrderAdvertisementDto: UpdateImagesOrderAdvertisementDto): Promise<void> {
        await this.updateImagesOrderAdvertisementuseCase.execute(authenticatedUser.accountId, advertisementId, updateImagesOrderAdvertisementDto);
    }

    @ApiBearerAuth()
    @Delete(':advertisementid/images')
    @Auth('ADMIN', 'USER')
    async deleteImages(
        @Authenticated() authenticatedUser: AuthenticatedUser,
        @Param('advertisementid') advertisementId: string,
        @Body() deleteImagesAdvertisementDto: DeleteImagesAdvertisementDto): Promise<void> {
        await this.deleteImagesAdvertisementUseCase.execute(authenticatedUser, advertisementId, deleteImagesAdvertisementDto);
    }

    @ApiBearerAuth()
    @Put(':advertisementid')
    @Auth('ADMIN', 'USER')
    @UsePipes(SlugifyPipe)
    @UsePipes(new ValidationPipe({transform: true}))
    async update(@Authenticated() authenticatedUser: AuthenticatedUser, @Param('advertisementid') advertisementId: string, @Body() createUpdateAdvertisementDto: CreateUpdateAdvertisementDto): Promise<{ id: string }> {
        return await this.updateAdvertisementUseCase.execute(
            authenticatedUser,
            advertisementId,
            createUpdateAdvertisementDto,
        );
    }

    @ApiBearerAuth()
    @Put(':advertisementid/status')
    @Auth('MASTER', 'ADMIN', 'USER')
    @UsePipes(new ValidationPipe({ transform: true }))
    async updateStatus(@Authenticated() authenticatedUser: AuthenticatedUser, @Param('advertisementid') advertisementId: string, @Body() updateStatusAdvertisementDto: UpdateStatusAdvertisementDto): Promise<void> {
        await this.updateStatusAllAdvertisementUseCase.execute({
            accountId: authenticatedUser.accountId,
            userId: authenticatedUser.userId,
            userRole: authenticatedUser.userRole,
            advertisementIds: [advertisementId],
            status: updateStatusAdvertisementDto.status,
        });
    }

    @ApiBearerAuth()
    @Delete()
    @Auth('MASTER', 'ADMIN', 'USER')
    async deleteAll(@Authenticated() authenticatedUser: AuthenticatedUser, @Body() deleteAdvertisementsDto: DeleteAdvertisementsDto ): Promise<void> {
        await this.deleteAllAdvertisementUseCase.execute(authenticatedUser, deleteAdvertisementsDto);
    }
}
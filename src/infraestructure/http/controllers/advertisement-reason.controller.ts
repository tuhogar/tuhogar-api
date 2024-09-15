import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateAdvertisementReasonUseCase } from 'src/application/use-cases/advertisement-reason/create-advertisement-reason.use-case';
import { DeleteAdvertisementReasonUseCase } from 'src/application/use-cases/advertisement-reason/delete-advertisement-reason.use-case';
import { GetAllAdvertisementReasonUseCase } from 'src/application/use-cases/advertisement-reason/get-all-advertisement-reason.use-case';
import { UpdateAdvertisementReasonUseCase } from 'src/application/use-cases/advertisement-reason/update-advertisement-reason.use-case';
import { AdvertisementReason } from 'src/domain/entities/advertisement-reason.interface';
import { Auth } from 'src/infraestructure/decorators/auth.decorator';
import { CreateUpdateAdvertisementReasonDto } from 'src/infraestructure/http/dtos/advertisement-reason/create-update-advertisement-reason.dto';

@ApiTags('v1/advertisement-reasons')
@Controller('v1/advertisement-reasons')
export class AdvertisementReasonController {
    constructor(
        private readonly createAdvertisementReasonUseCase: CreateAdvertisementReasonUseCase,
        private readonly deleteAdvertisementReasonUseCase: DeleteAdvertisementReasonUseCase,
        private readonly getAllAdvertisementReasonUseCase: GetAllAdvertisementReasonUseCase,
        private readonly updateAdvertisementReasonUseCase: UpdateAdvertisementReasonUseCase,
    ) {}

    @Get()
    async getAll(): Promise<AdvertisementReason[]> {
        return this.getAllAdvertisementReasonUseCase.execute();
    }

    @Post()
    @Auth('MASTER')
    async create(@Body() createUpdateAdvertisementReasonDto: CreateUpdateAdvertisementReasonDto): Promise<void> {
        await this.createAdvertisementReasonUseCase.execute(createUpdateAdvertisementReasonDto);
    }

    @ApiBearerAuth()
    @Delete(':advertisementreasonid')
    @Auth('MASTER')
    async delete(@Param('advertisementreasonid') advertisementReasonId: string): Promise<void> {
        await this.deleteAdvertisementReasonUseCase.execute(advertisementReasonId);
    }

    @ApiBearerAuth()
    @Put(':advertisementreasonid')
    @Auth('MASTER')
    async update(@Param('advertisementreasonid') advertisementReasonId: string, @Body() createUpdateAdvertisementReasonDto: CreateUpdateAdvertisementReasonDto): Promise<{ id: string }> {
        return await this.updateAdvertisementReasonUseCase.execute(
            advertisementReasonId,
            createUpdateAdvertisementReasonDto,
        );
    }
}
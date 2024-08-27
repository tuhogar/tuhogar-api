import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdvertisementReasonService } from 'src/application/use-cases/advertisement-reason/advertisement-reason.service';
import { AdvertisementReason } from 'src/domain/entities/advertisement-reason.interface';
import { Auth } from 'src/infraestructure/decorators/auth.decorator';
import { CreateUpdateAdvertisementReasonDto } from 'src/infraestructure/http/dtos/advertisement-reason/create-update-advertisement-reason.dto';

@ApiTags('v1/advertisement-reasons')
@Controller('v1/advertisement-reasons')
export class AdvertisementReasonController {
    constructor(
        private readonly advertisementReasonService: AdvertisementReasonService,
    ) {}

    @Get()
    async getAll(): Promise<AdvertisementReason[]> {
        return this.advertisementReasonService.getAll();
    }

    @Post()
    @Auth('MASTER')
    async create(@Body() createUpdateAdvertisementReasonDto: CreateUpdateAdvertisementReasonDto): Promise<void> {
        await this.advertisementReasonService.create(createUpdateAdvertisementReasonDto);
    }

    @ApiBearerAuth()
    @Delete(':advertisementreasonid')
    @Auth('MASTER')
    async delete(@Param('advertisementreasonid') advertisementReasonId: string): Promise<void> {
        await this.advertisementReasonService.delete(advertisementReasonId);
    }

    @ApiBearerAuth()
    @Put(':advertisementreasonid')
    @Auth('MASTER')
    async update(@Param('advertisementreasonid') advertisementReasonId: string, @Body() createUpdateAdvertisementReasonDto: CreateUpdateAdvertisementReasonDto): Promise<{ id: string }> {
        return await this.advertisementReasonService.update(
            advertisementReasonId,
            createUpdateAdvertisementReasonDto,
        );
    }
}
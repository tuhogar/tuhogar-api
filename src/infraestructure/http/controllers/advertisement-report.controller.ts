import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdvertisementReportService } from 'src/application/use-cases/advertisement-report/advertisement-report.service';
import { CreateAdvertisementReportDto } from 'src/infraestructure/http/dtos/advertisement-report/create-advertisement-report.dto';
import { Auth } from 'src/infraestructure/decorators/auth.decorator';
import { AdvertisementReport } from 'src/domain/entities/advertisement-report.interface';
import { AdvertisementService } from 'src/application/use-cases/advertisement/advertisement.service';

@ApiTags('v1/advertisement-reports')
@Controller('v1/advertisement-reports')
export class AdvertisementReportController {
    constructor(
        private readonly advertisementReportService: AdvertisementReportService,
        private readonly advertisementService: AdvertisementService,
    ) {}

    @Post()
    async create(@Body() createAdvertisementReportDto: CreateAdvertisementReportDto): Promise<{ id: string }> {
        return this.advertisementReportService.create(createAdvertisementReportDto);
    }

    @ApiBearerAuth()
    @Get('advertisements/:advertisementid')
    @Auth('MASTER')
    async getByAdvertisementId(@Param('advertisementid') advertisementId: string): Promise<AdvertisementReport[]> {
        return this.advertisementReportService.getByAdvertisementId(advertisementId);
    }

    @ApiBearerAuth()
    @Delete(':advertisementreportid')
    @Auth('MASTER')
    async delete(@Param('advertisementreportid') advertisementReportId: string): Promise<void> {
        await this.advertisementReportService.delete(advertisementReportId);
    }

    @ApiBearerAuth()
    @Auth('MASTER')
    @Get()
    async findAll() {
        return this.advertisementService.findAllWithReports();
    }
}
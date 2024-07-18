import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdvertisementReportsService } from './advertisement-reports.service';
import { CreateAdvertisementReportDto } from './dtos/create-advertisement-report.dto';
import { Auth } from 'src/decorators/auth.decorator';
import { AdvertisementReport } from './interfaces/advertisement-reports.interface';

@ApiTags('v1/advertisement-reports')
@Controller('v1/advertisement-reports')
export class AdvertisementReportsController {
    constructor(
        private readonly advertisementReportsService: AdvertisementReportsService,
    ) {}

    @Post()
    async create(@Body() createAdvertisementReportDto: CreateAdvertisementReportDto): Promise<{ id: string }> {
        return this.advertisementReportsService.create(createAdvertisementReportDto);
    }

    @ApiBearerAuth()
    @Get('advertisements/:advertisementid')
    @Auth('MASTER')
    async getByAdvertisementId(@Param('advertisementid') advertisementId: string): Promise<AdvertisementReport[]> {
        return this.advertisementReportsService.getByAdvertisementId(advertisementId);
    }

    @ApiBearerAuth()
    @Delete(':advertisementreportid')
    @Auth('MASTER')
    async delete(@Param('advertisementreportid') advertisementReportId: string): Promise<void> {
        await this.advertisementReportsService.delete(advertisementReportId);
    }
}

import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateAdvertisementReportDto } from 'src/infraestructure/http/dtos/advertisement-report/create-advertisement-report.dto';
import { Auth } from 'src/infraestructure/decorators/auth.decorator';
import { AdvertisementReport } from 'src/domain/entities/advertisement-report';
import { CreateAdvertisementReportUseCase } from 'src/application/use-cases/advertisement-report/create-advertisement-report.use-case';
import { DeleteAdvertisementReportUseCase } from 'src/application/use-cases/advertisement-report/delete-advertisement-report.use-case';
import { GetByAdvertisementIdAdvertisementReportUseCase } from 'src/application/use-cases/advertisement-report/get-by-advertisement-id-advertisement-report.use-case';
import { FindAllWithReportsAdvertisementUseCase } from 'src/application/use-cases/advertisement/find-all-with-reports-advertisement.use-case';

@ApiTags('v1/advertisement-reports')
@Controller('v1/advertisement-reports')
export class AdvertisementReportController {
    constructor(
        private readonly createAdvertisementReportUseCase: CreateAdvertisementReportUseCase,
        private readonly deleteAdvertisementReportUseCase: DeleteAdvertisementReportUseCase,
        private readonly getByAdvertisementIdAdvertisementReportUseCase: GetByAdvertisementIdAdvertisementReportUseCase,
        private readonly findAllWithReportsAdvertisementUseCase: FindAllWithReportsAdvertisementUseCase,
    ) {}

    @Post()
    async create(@Body() createAdvertisementReportDto: CreateAdvertisementReportDto): Promise<AdvertisementReport> {
        const response = await this.createAdvertisementReportUseCase.execute(createAdvertisementReportDto);
        if (!response) return null;

        return response;
    }

    @ApiBearerAuth()
    @Get('advertisements/:advertisementid')
    @Auth('MASTER')
    async getByAdvertisementId(@Param('advertisementid') advertisementId: string): Promise<AdvertisementReport[]> {
        const response = await this.getByAdvertisementIdAdvertisementReportUseCase.execute({ advertisementId });
        return response;
    }

    @ApiBearerAuth()
    @Delete(':advertisementreportid')
    @Auth('MASTER')
    async delete(@Param('advertisementreportid') advertisementReportId: string): Promise<void> {
        await this.deleteAdvertisementReportUseCase.execute({ id: advertisementReportId });
    }

    @ApiBearerAuth()
    @Auth('MASTER')
    @Get()
    async findAll() {
        return this.findAllWithReportsAdvertisementUseCase.execute();
    }
}
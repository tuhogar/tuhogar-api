import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IAdvertisementReportRepository } from 'src/application/interfaces/repositories/advertisement-report.repository.interface';
import { AdvertisementReport } from 'src/domain/entities/advertisement-report.interface';
import { CreateAdvertisementReportDto } from 'src/infraestructure/http/dtos/advertisement-report/create-advertisement-report.dto';

@Injectable()
export class CreateAdvertisementReportUseCase {
    constructor(
        private readonly advertisementReportRepository: IAdvertisementReportRepository,
    ) {}

    async execute(
        createAdvertisementReportDto: CreateAdvertisementReportDto,
    ): Promise<{ id: string }> {
        return this.advertisementReportRepository.create(createAdvertisementReportDto);
    }
}
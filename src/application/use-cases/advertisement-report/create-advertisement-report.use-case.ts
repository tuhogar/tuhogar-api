import { Injectable } from '@nestjs/common';
import { IAdvertisementReportRepository } from 'src/application/interfaces/repositories/advertisement-report.repository.interface';
import { AdvertisementReport } from 'src/domain/entities/advertisement-report';
import { CreateAdvertisementReportDto } from 'src/infraestructure/http/dtos/advertisement-report/create-advertisement-report.dto';

interface CreateAdvertisementReportUseCaseCommand {
    advertisementId: string,
    advertisementReasonId: string,
}

@Injectable()
export class CreateAdvertisementReportUseCase {
    constructor(
        private readonly advertisementReportRepository: IAdvertisementReportRepository,
    ) {}

    async execute(
        { advertisementId, advertisementReasonId }: CreateAdvertisementReportUseCaseCommand,
    ): Promise<AdvertisementReport> {
        const advertisementReport = new AdvertisementReport({
            advertisementId,
            advertisementReasonId,
        })

        const response = await this.advertisementReportRepository.create(advertisementReport);
        return response;
    }
}
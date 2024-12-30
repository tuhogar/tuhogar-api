import { Injectable } from '@nestjs/common';
import { IAdvertisementReportRepository } from 'src/application/interfaces/repositories/advertisement-report.repository.interface';
import { AdvertisementReport } from 'src/domain/entities/advertisement-report';

interface GetByAdvertisementIdAdvertisementReportUseCaseCommand {
    advertisementId: string,
}

@Injectable()
export class GetByAdvertisementIdAdvertisementReportUseCase {
    constructor(
        private readonly advertisementReportRepository: IAdvertisementReportRepository,
    ) {}

    async execute({ advertisementId }: GetByAdvertisementIdAdvertisementReportUseCaseCommand): Promise<AdvertisementReport[]> {
        return this.advertisementReportRepository.findByAdvertisementId(advertisementId);
    }
}
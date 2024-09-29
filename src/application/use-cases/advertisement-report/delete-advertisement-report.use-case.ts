import { Injectable } from '@nestjs/common';
import { IAdvertisementReportRepository } from 'src/application/interfaces/repositories/advertisement-report.repository.interface';

interface DeleteAdvertisementReportUseCaseCommand {
    id: string,
}

@Injectable()
export class DeleteAdvertisementReportUseCase {
    constructor(
        private readonly advertisementReportRepository: IAdvertisementReportRepository,
    ) {}

    async execute({ id }: DeleteAdvertisementReportUseCaseCommand): Promise<void> {
        await this.advertisementReportRepository.deleteOne(id);
    }
}
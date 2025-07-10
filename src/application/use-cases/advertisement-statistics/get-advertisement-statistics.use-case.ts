import { Inject, Injectable } from '@nestjs/common';
import { AdvertisementStatistics } from 'src/domain/entities/advertisement-statistics';
import { IAdvertisementStatisticsRepository } from 'src/application/interfaces/repositories/advertisement-statistics.repository.interface';
import { IAdvertisementRepository } from 'src/application/interfaces/repositories/advertisement.repository.interface';

interface GetAdvertisementStatisticsUseCaseCommand {
    month?: string; // Formato: "YYYY-MM", opcional
}

@Injectable()
export class GetAdvertisementStatisticsUseCase {
    constructor(
        private readonly advertisementStatisticsRepository: IAdvertisementStatisticsRepository,
        private readonly advertisementRepository: IAdvertisementRepository
    ) {}

    /**
     * Busca um relatório específico pelo mês
     */
    async getByMonth(month: string): Promise<AdvertisementStatistics> {
        const statistics = await this.advertisementStatisticsRepository.findByMonth(month);

        if (!statistics) {
            throw new Error('notfound.advertisement.statistics.do.not.exists');
        }

        const advertisementIds = [];

        statistics.topViewedAdvertisements.sale.forEach(advertisement => {
            advertisementIds.push(advertisement.advertisementId);
        });

        statistics.topViewedAdvertisements.rent.forEach(advertisement => {
            advertisementIds.push(advertisement.advertisementId);
        });

        statistics.topInteractedAdvertisements.sale.forEach(advertisement => {
            advertisementIds.push(advertisement.advertisementId);
        });

        statistics.topInteractedAdvertisements.rent.forEach(advertisement => {
            advertisementIds.push(advertisement.advertisementId);
        });

        if (advertisementIds.length > 0) {
            // Busca todos os anúncios pelos IDs (sem filtrar por conta)
            const advertisements = await this.advertisementRepository.findByIds(advertisementIds);
            
            statistics.topViewedAdvertisements.sale.forEach(advertisement => {
                advertisement.advertisement = advertisements.find(ad => ad.id === advertisement.advertisementId);
            });
            
            statistics.topViewedAdvertisements.rent.forEach(advertisement => {
                advertisement.advertisement = advertisements.find(ad => ad.id === advertisement.advertisementId);
            });
            
            statistics.topInteractedAdvertisements.sale.forEach(advertisement => {
                advertisement.advertisement = advertisements.find(ad => ad.id === advertisement.advertisementId);
            });
            
            statistics.topInteractedAdvertisements.rent.forEach(advertisement => {
                advertisement.advertisement = advertisements.find(ad => ad.id === advertisement.advertisementId);
            });
        }

        return statistics;
    }

    /**
     * Lista todos os meses disponíveis
     */
    async getAllMonths(): Promise<string[]> {
        const allMonths = await this.advertisementStatisticsRepository.findAllMonths();

        if (!allMonths || allMonths.length === 0) {
            throw new Error('notfound.advertisement.statistics.do.not.exists');
        }

        return allMonths;
    }
}

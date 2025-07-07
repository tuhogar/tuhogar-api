import { Injectable } from '@nestjs/common';
import { AccountAdvertisementStatistics } from 'src/domain/entities/account-advertisement-statistics';
import { IAccountAdvertisementStatisticsRepository } from 'src/application/interfaces/repositories/account-advertisement-statistics.repository.interface';
import { IAdvertisementRepository } from 'src/application/interfaces/repositories/advertisement.repository.interface';

interface GetAccountAdvertisementStatisticsUseCaseCommand {
    accountId: string;
    month?: string; // Formato: "YYYY-MM", opcional
}

@Injectable()
export class GetAccountAdvertisementStatisticsUseCase {
    constructor(
        private readonly accountAdvertisementStatisticsRepository: IAccountAdvertisementStatisticsRepository,
        private readonly advertisementRepository: IAdvertisementRepository
    ) {}

    /**
     * Busca um relatório específico pelo mês
     */
    async getByMonth(accountId: string, month: string): Promise<AccountAdvertisementStatistics> {
        const statistics = await this.accountAdvertisementStatisticsRepository.findByAccountIdAndMonth(
            accountId, 
            month
        );

        if (!statistics) {
            throw new Error('notfound.account.advertisement.statistics.do.not.exists');
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
            const advertisements = await this.advertisementRepository.findByIdsAndAccountId(advertisementIds, undefined);
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
     * Lista todos os meses de uma conta
     */
    async getAllMonthsByAccount(accountId: string): Promise<string[]> {
        const allMonths = await this.accountAdvertisementStatisticsRepository.findAllMonthsByAccountId(
            accountId
        );

        if (!allMonths || allMonths.length === 0) {
            throw new Error('notfound.account.advertisement.statistics.do.not.exists');
        }

        return allMonths;
    }
}

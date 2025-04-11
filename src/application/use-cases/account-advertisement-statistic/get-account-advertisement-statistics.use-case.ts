import { Injectable } from '@nestjs/common';
import { AccountAdvertisementStatistics } from 'src/domain/entities/account-advertisement-statistics';
import { IAccountAdvertisementStatisticsRepository } from 'src/application/interfaces/repositories/account-advertisement-statistics.repository.interface';

interface GetAccountAdvertisementStatisticsUseCaseCommand {
    accountId: string;
    month?: string; // Formato: "YYYY-MM", opcional
}

@Injectable()
export class GetAccountAdvertisementStatisticsUseCase {
    constructor(
        private readonly accountAdvertisementStatisticsRepository: IAccountAdvertisementStatisticsRepository,
    ) {}

    async execute({ accountId, month }: GetAccountAdvertisementStatisticsUseCaseCommand): Promise<AccountAdvertisementStatistics | AccountAdvertisementStatistics[]> {
        // Se o mês for informado, buscar estatísticas específicas
        if (month) {
            return this.getByMonth(accountId, month);
        } 
        
        // Se o mês não for informado, buscar todas as estatísticas da conta
        return this.getAllByAccount(accountId);
    }

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

        return statistics;
    }

    /**
     * Lista todos os relatórios de uma conta
     */
    async getAllByAccount(accountId: string): Promise<AccountAdvertisementStatistics[]> {
        const allStatistics = await this.accountAdvertisementStatisticsRepository.findAllByAccountId(
            accountId
        );

        if (!allStatistics || allStatistics.length === 0) {
            throw new Error('notfound.account.advertisement.statistics.do.not.exists');
        }

        return allStatistics;
    }
}

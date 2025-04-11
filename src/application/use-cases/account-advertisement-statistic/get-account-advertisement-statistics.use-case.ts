import { Injectable } from '@nestjs/common';
import { AccountAdvertisementStatistics } from 'src/domain/entities/account-advertisement-statistics';
import { IAccountAdvertisementStatisticsRepository } from 'src/application/interfaces/repositories/account-advertisement-statistics.repository.interface';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user';

interface GetAccountAdvertisementStatisticsUseCaseCommand {
    authenticatedUser: AuthenticatedUser;
    month: string; // Formato: "YYYY-MM"
}

@Injectable()
export class GetAccountAdvertisementStatisticsUseCase {
    constructor(
        private readonly accountAdvertisementStatisticsRepository: IAccountAdvertisementStatisticsRepository,
    ) {}

    async execute({ authenticatedUser, month }: GetAccountAdvertisementStatisticsUseCaseCommand): Promise<AccountAdvertisementStatistics> {
        // Buscar estatísticas da conta para o mês especificado
        const statistics = await this.accountAdvertisementStatisticsRepository.findByAccountIdAndMonth(
            authenticatedUser.accountId, 
            month
        );

        if (!statistics) {
            throw new Error('notfound.account.advertisement.statistics.do.not.exists');
        }

        return statistics;
    }
}

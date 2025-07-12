import { AccountAdvertisementStatistics } from 'src/domain/entities/account-advertisement-statistics';

export abstract class IAccountAdvertisementStatisticsRepository {
  abstract create(statistics: AccountAdvertisementStatistics): Promise<AccountAdvertisementStatistics>;
  abstract findByAccountIdAndMonth(accountId: string, month: string): Promise<AccountAdvertisementStatistics>;
  abstract findAllMonthsByAccountId(accountId: string): Promise<string[]>;
  abstract update(id: string, statistics: Partial<AccountAdvertisementStatistics>): Promise<AccountAdvertisementStatistics>;
  abstract findLastAccumulatedByAccountId(accountId: string): Promise<AccountAdvertisementStatistics>;
}

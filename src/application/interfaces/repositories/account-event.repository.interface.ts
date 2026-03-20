import { AccountEvent } from 'src/domain/entities/account-event';

export abstract class IAccountEventRepository {
  abstract findOneByAccountIdAndType(
    accountId: string,
    type: string,
  ): Promise<AccountEvent>;
  abstract create(accountEvent: AccountEvent): Promise<AccountEvent>;
  abstract update(id: string, count: number): Promise<AccountEvent>;
  abstract findByAccountId(accountId: string): Promise<AccountEvent[]>;
  abstract findAllGroupedByType(): Promise<AccountEvent[]>;
}

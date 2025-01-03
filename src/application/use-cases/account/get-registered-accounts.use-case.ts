import { Injectable } from '@nestjs/common';
import { IAccountRepository } from 'src/application/interfaces/repositories/account.repository.interface';

@Injectable()
export class GetRegisteredAccountsUseCase {
  constructor(
    private readonly accountRepository: IAccountRepository,
  ) {}

  async execute(period: 'week' | 'month'): Promise<any[]> {
    return this.accountRepository.getRegisteredAccounts(period);
  }
}

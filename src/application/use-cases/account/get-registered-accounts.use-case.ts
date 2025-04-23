import { Injectable } from '@nestjs/common';
import { IAccountRepository } from 'src/application/interfaces/repositories/account.repository.interface';

interface GetRegisteredAccountsUseCaseCommand {
  period: 'week' | 'month';
}

@Injectable()
export class GetRegisteredAccountsUseCase {
  constructor(
    private readonly accountRepository: IAccountRepository,
  ) {}

  async execute({
    period
  }: GetRegisteredAccountsUseCaseCommand): Promise<any[]> {
    return this.accountRepository.getRegisteredAccounts(period);
  }
}

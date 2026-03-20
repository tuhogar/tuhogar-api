import { Injectable } from '@nestjs/common';
import { IAccountEventRepository } from 'src/application/interfaces/repositories/account-event.repository.interface';
import { AccountEvent } from 'src/domain/entities/account-event';

interface GetAccountEventsUseCaseCommand {
  accountId?: string;
}

@Injectable()
export class GetAccountEventsUseCase {
  constructor(
    private readonly accountEventRepository: IAccountEventRepository,
  ) {}

  async execute({
    accountId,
  }: GetAccountEventsUseCaseCommand): Promise<AccountEvent[]> {
    if (accountId) {
      return this.accountEventRepository.findByAccountId(accountId);
    }
    return this.accountEventRepository.findAllGroupedByType();
  }
}

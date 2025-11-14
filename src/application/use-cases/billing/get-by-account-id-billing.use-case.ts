import { Injectable } from '@nestjs/common';
import { Billing } from 'src/domain/entities/billing';
import { IBillingRepository } from 'src/application/interfaces/repositories/billing.repository.interface';

interface GetByAccountIdBillingUseCaseCommand {
  accountId: string;
}

@Injectable()
export class GetByAccountIdBillingUseCase {
  constructor(
    private readonly billingRepository: IBillingRepository,
  ) {}

  async execute({
    accountId
  }: GetByAccountIdBillingUseCaseCommand): Promise<Billing> {
    return this.billingRepository.findOneByAccountId(accountId);
  }
}

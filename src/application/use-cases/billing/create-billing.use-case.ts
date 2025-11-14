import { Injectable } from '@nestjs/common';
import { IBillingRepository } from 'src/application/interfaces/repositories/billing.repository.interface';
import { AccountDocumentType } from 'src/domain/entities/account';
import { Billing } from 'src/domain/entities/billing';

interface CreateBillingUseCaseCommand {
  accountId: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  documentType?: AccountDocumentType;
  documentNumber?: string;
}

@Injectable()
export class CreateBillingUseCase {
  constructor(
    private readonly billingRepository: IBillingRepository,
  ) {}

  async execute({
    accountId,
    name,
    email,
    phone,
    address,
    documentType,
    documentNumber
  }: CreateBillingUseCaseCommand): Promise<{ accountId: string }> {
    const billing = new Billing({
      accountId,
      name,
      email,
      phone,
      address,
      documentType,
      documentNumber,
    });
    const billingCreated = await this.billingRepository.create(billing);

    return { accountId: billingCreated.accountId };
  }
}

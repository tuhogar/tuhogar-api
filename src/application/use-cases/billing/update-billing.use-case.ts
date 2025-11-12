import { Injectable } from '@nestjs/common';
import { IBillingRepository } from 'src/application/interfaces/repositories/billing.repository.interface';
import { AccountDocumentType } from 'src/domain/entities/account';

interface UpdateBillingUseCaseCommand {
  accountId: string;
  name: string;
  email: string;
  phone: string
  address?: string;
  documentType?: AccountDocumentType;
  documentNumber?: string;
}

@Injectable()
export class UpdateBillingUseCase {
    constructor(
        private readonly billingRepository: IBillingRepository,
    ) {}

    async execute({ accountId, name, email, phone, address, documentType, documentNumber }: UpdateBillingUseCaseCommand): Promise<{ accountId: string }> {

        const billing = await this.billingRepository.findOneByAccountId(accountId);
        if (!billing) throw new Error('notfound.billing.do.not.exists');

        const updatedBilling = await this.billingRepository.update(
            accountId,
            name,
            email,
            phone,
            address,
            documentType,
            documentNumber,
        );

        return { accountId: updatedBilling.accountId };
    }
}
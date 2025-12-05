import { Injectable } from '@nestjs/common';
import { IPaymentGateway } from 'src/application/interfaces/payment-gateway/payment-gateway.interface';
import { AccountDocumentType } from 'src/domain/entities/account';

/**
 * Comando para execução do caso de uso UpdateCustomerSubscriptionUseCase
 */
export interface UpdateCustomerSubscriptionUseCaseCommand {
  customerId: string,
  name: string,
  email: string,
  address: string,
  phone: string,
  documentType: AccountDocumentType,
  documentNumber: string,
}

@Injectable()
export class UpdateCustomerSubscriptionUseCase {
  constructor(
    private readonly paymentGateway: IPaymentGateway,
  ) {}
  
  async execute({ customerId, name, email, address, phone, documentType, documentNumber }: UpdateCustomerSubscriptionUseCaseCommand): Promise<{ customerId: string }> {
    console.log('execute-start');
    console.log('customerId: ', customerId);
    console.log('name: ', name);
    console.log('email: ', email);
    console.log('address: ', address);
    console.log('phone: ', phone);
    console.log('documentType: ', documentType);
    console.log('documentNumber: ', documentNumber);

    const result = await this.paymentGateway.updateCustomer(customerId, name, email, address, phone, documentType, documentNumber);
    console.log('updateCustomer result: ', result);
    console.log('execute-end');
    return { customerId: result.customerId };
  }
}

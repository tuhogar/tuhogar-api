import { Injectable } from '@nestjs/common';
import { IPaymentGateway } from 'src/application/interfaces/payment-gateway/payment-gateway.interface';
import { SubscriptionStatus } from 'src/domain/entities/subscription';
import { ConfigService } from '@nestjs/config';
import { ISubscriptionRepository } from 'src/application/interfaces/repositories/subscription.repository.interface';

/**
 * Comando para execução do caso de uso GetCustomerSubscriptionUseCase
 */
export interface GetCustomerSubscriptionUseCaseCommand {
  customerId: string;
}

@Injectable()
export class GetCustomerSubscriptionUseCase {
  constructor(
    private readonly paymentGateway: IPaymentGateway,
  ) {
  }
  
  async execute({ customerId }: GetCustomerSubscriptionUseCaseCommand): Promise<void> {
    return this.paymentGateway.getCustomer(customerId);

  }
}

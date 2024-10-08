import { Injectable } from '@nestjs/common';
//import { IPaymentGateway } from 'src/application/interfaces/payment-gateway/payment-gateway.interface';
//import { ISubscriptionRepository } from 'src/application/interfaces/repositories/subscription.repository.interface';
//import { Subscription } from 'src/domain/entities/subscription';

interface CancelSubscriptionUseCaseCommand {
  accountId: string;
}

@Injectable()
export class CancelSubscriptionUseCase {
  constructor(
    //private readonly subscriptionRepository: ISubscriptionRepository,
    //private readonly paymentGateway: IPaymentGateway,
  ) {}

  async execute({ accountId }: CancelSubscriptionUseCaseCommand) { //: Promise<Subscription> {
    //const subscription = await this.subscriptionRepository.findByAccountId(accountId);
    
    //if (!subscription) throw new Error('notfound.subscription.do.not.exists');

    //// TODO:
    //// Validar se a subscription está apta à ser cancelada.
    //// Por exemplo: Se está ativa no momento

    //await this.paymentGateway.cancelSubscription(subscription.externalId);


    //return await this.subscriptionRepository.cancel(subscription.id);
  }
}

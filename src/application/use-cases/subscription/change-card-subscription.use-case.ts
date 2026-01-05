import { Injectable } from '@nestjs/common';
import { IPaymentGateway } from 'src/application/interfaces/payment-gateway/payment-gateway.interface';
import { SubscriptionStatus } from 'src/domain/entities/subscription';
import { ConfigService } from '@nestjs/config';
import { ISubscriptionRepository } from 'src/application/interfaces/repositories/subscription.repository.interface';
import { IAccountRepository } from 'src/application/interfaces/repositories/account.repository.interface';

/**
 * Comando para execução do caso de uso GetCustomerSubscription
 */
export interface ChangeCardSubscriptionUseCaseCommand {
  accountId: string;
  actualPlanId: string;
  actualSubscriptionId: string;
  actualSubscriptionStatus: SubscriptionStatus;
  paymentData: Record<string, any>
}

@Injectable()
export class ChangeCardSubscriptionUseCase {
  private readonly firstSubscriptionPlanId: string;
  constructor(
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly paymentGateway: IPaymentGateway,
    private readonly configService: ConfigService,
    private readonly accountRepository: IAccountRepository,
  ) {
    this.firstSubscriptionPlanId = this.configService.get<string>('FIRST_SUBSCRIPTION_PLAN_ID');
  }
  
  async execute({ accountId, actualPlanId, actualSubscriptionId, actualSubscriptionStatus, paymentData }: ChangeCardSubscriptionUseCaseCommand): Promise<void> {
    console.log('execute-start');
    console.log('accountId: ', accountId);
    console.log('actualPlanId: ', actualPlanId);
    console.log('actualSubscriptionId: ', actualSubscriptionId);
    console.log('actualSubscriptionStatus: ', actualSubscriptionStatus);
    console.log('paymentData: ', JSON.stringify(paymentData));

    if (actualPlanId === this.firstSubscriptionPlanId ||
       (actualPlanId !== this.firstSubscriptionPlanId && 
        actualSubscriptionStatus !== SubscriptionStatus.ACTIVE
      )
    ) {
      console.log('error.subscription.not.exists');
      throw new Error('error.subscription.not.exists');
    }

    
    const subscription = await this.subscriptionRepository.findOneById(actualSubscriptionId);
    console.log('subscription: ', JSON.stringify(subscription));
    if (!subscription) throw new Error('error.subscription.not.exists');
    
    await this.paymentGateway.changeCard(subscription.externalPayerReference, paymentData);
    await this.accountRepository.updatePaymentToken(accountId, paymentData.token);
    console.log('execute-end');

  }
}

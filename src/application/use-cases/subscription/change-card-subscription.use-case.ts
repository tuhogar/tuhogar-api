import { Injectable } from '@nestjs/common';
import { IPaymentGateway } from 'src/application/interfaces/payment-gateway/payment-gateway.interface';
import { SubscriptionStatus } from 'src/domain/entities/subscription';
import { ConfigService } from '@nestjs/config';
import { ISubscriptionRepository } from 'src/application/interfaces/repositories/subscription.repository.interface';

/**
 * Comando para execução do caso de uso GetCustomerSubscription
 */
export interface ChangeCardSubscriptionUseCaseCommand {
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
  ) {
    this.firstSubscriptionPlanId = this.configService.get<string>('FIRST_SUBSCRIPTION_PLAN_ID');
  }
  
  async execute({ actualPlanId, actualSubscriptionId, actualSubscriptionStatus, paymentData }: ChangeCardSubscriptionUseCaseCommand): Promise<void> {

    if (actualPlanId === this.firstSubscriptionPlanId ||
       (actualPlanId !== this.firstSubscriptionPlanId && 
        actualSubscriptionStatus !== SubscriptionStatus.ACTIVE
      )
    ) {
      console.log('error.subscription.not.exists');
      throw new Error('error.subscription.not.exists');
    }

    
    const subscription = await this.subscriptionRepository.findOneById(actualSubscriptionId);
    console.log('subscription: ', subscription);
    if (!subscription) throw new Error('error.subscription.not.exists');
    
    await this.paymentGateway.changeCard(subscription.externalPayerReference, paymentData);

  }
}

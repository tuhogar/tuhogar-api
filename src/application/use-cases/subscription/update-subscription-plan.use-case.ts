import { Injectable } from '@nestjs/common';
import { ISubscriptionRepository } from 'src/application/interfaces/repositories/subscription.repository.interface';
import { IPaymentGateway } from 'src/application/interfaces/payment-gateway/payment-gateway.interface';
import { Subscription, SubscriptionStatus } from 'src/domain/entities/subscription';
import { IPlanRepository } from 'src/application/interfaces/repositories/plan.repository.interface';
import { ConfigService } from '@nestjs/config';
import { IAccountRepository } from 'src/application/interfaces/repositories/account.repository.interface';
import { CreateSubscriptionUseCase } from './create-subscription.use-case';

interface UpdateSubscriptionPlanUseCaseCommand {
  actualSubscriptionId: string;
  accountId: string;
  planId: string;
  paymentData: Record<string, any>
}

@Injectable()
export class UpdateSubscriptionPlanUseCase {
  private readonly firstSubscriptionPlanId: string;
  constructor(
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly planRepository: IPlanRepository,
    private readonly paymentGateway: IPaymentGateway,
    private readonly configService: ConfigService,
    private readonly accountRepository: IAccountRepository,
    private readonly createSubscriptionUseCase: CreateSubscriptionUseCase,
  ) {
    this.firstSubscriptionPlanId = this.configService.get<string>('FIRST_SUBSCRIPTION_PLAN_ID');
  }

  async execute({ actualSubscriptionId, accountId, planId, paymentData }: UpdateSubscriptionPlanUseCaseCommand): Promise<Subscription> {
    
    const account = await this.accountRepository.findOneById(accountId);
    if (!account) throw new Error('invalid.account.do.not.exists');

    const actualSubscription = await this.subscriptionRepository.findOneWithResultIntegrationById(actualSubscriptionId);
    if (!actualSubscription) throw new Error('invalid.subscription.do.not.exists');

    if (actualSubscription.status !== SubscriptionStatus.ACTIVE || actualSubscription.planId === this.firstSubscriptionPlanId) throw new Error('invalid.subscription.do.not.active');

    const plan = await this.planRepository.findOneById(planId);
    if (!plan) throw new Error('invalid.plan.do.not.exists');

    try {

      const customer = await this.paymentGateway.getCustomer(actualSubscription.externalPayerReference);
      if (!customer) throw new Error('invalid.customer.do.not.exists');
      const card = customer.data.cards.find((card: any) => card.default);
      if (!card) throw new Error('invalid.customer.card.not.exists');

      return this.createSubscriptionUseCase.execute({ 
        actualSubscriptionId, 
        actualSubscriptionStatus: actualSubscription.status, 
        actualPlanId: actualSubscription.planId, 
        accountId, 
        planId, 
        paymentData: {
          token: card.token,
          docType: customer.data.doc_type,
          docNumber: customer.data.doc_number,
          address: paymentData.address,
          city: paymentData.city,
          phone: customer.data.phone,
          ip: paymentData.ip,
        }, 
      });
    } catch (error) {
      throw new Error(`Failed to update subscription: ${error.message}`);
    }
  }
}

import { Injectable } from '@nestjs/common';
import { ISubscriptionRepository } from 'src/application/interfaces/repositories/subscription.repository.interface';
import { IPaymentGateway } from 'src/application/interfaces/payment-gateway/payment-gateway.interface';
import { Subscription, SubscriptionStatus } from 'src/domain/entities/subscription';
import { IPlanRepository } from 'src/application/interfaces/repositories/plan.repository.interface';
import { ConfigService } from '@nestjs/config';
import { IAccountRepository } from 'src/application/interfaces/repositories/account.repository.interface';
import { CreateSubscriptionUseCase } from './create-subscription.use-case';
import { CancelSubscriptionOnPaymentGatewayUseCase } from './cancel-subscription-on-payment-gateway.use-case';

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
    private readonly cancelSubscriptionOnPaymentGatewayUseCase: CancelSubscriptionOnPaymentGatewayUseCase,
  ) {
    this.firstSubscriptionPlanId = this.configService.get<string>('FIRST_SUBSCRIPTION_PLAN_ID');
  }

  async execute({ actualSubscriptionId, accountId, planId, paymentData }: UpdateSubscriptionPlanUseCaseCommand): Promise<Subscription> {
    
    const account = await this.accountRepository.findOneByIdWithPaymentData(accountId);
    if (!account) throw new Error('invalid.account.do.not.exists');

    const actualSubscription = await this.subscriptionRepository.findOneWithResultIntegrationById(actualSubscriptionId);
    if (!actualSubscription) throw new Error('invalid.subscription.do.not.exists');

    if (actualSubscription.status !== SubscriptionStatus.ACTIVE || actualSubscription.planId === this.firstSubscriptionPlanId) throw new Error('invalid.subscription.do.not.active');

    const plan = await this.planRepository.findOneById(planId);
    if (!plan) throw new Error('invalid.plan.do.not.exists');

    try {

      const customer = await this.paymentGateway.getCustomer(actualSubscription.externalPayerReference);
      if (!customer) throw new Error('invalid.customer.do.not.exists');

      let planIds: string[] = [
        this.firstSubscriptionPlanId,
        "6931de07a3f1180792e76447",
        "6941a0d48cb266c438999944",
        "6941a08e8cb266c438999943",
      ];


      if (accountId === '695c12e93ba12b26a8447952') {
            planIds = [
                this.firstSubscriptionPlanId,
                "694189908cb266c438999938",
                "6931de07a3f1180792e76447",
                "6941a0d48cb266c438999944",
                "6941a08e8cb266c438999943"
            ];
        }

      const actualSubscriptionPlanIdIndex = planIds.indexOf(actualSubscription.planId);
      const planIdIndex = planIds.indexOf(planId);

      if (actualSubscriptionPlanIdIndex === -1 || planIdIndex === -1) throw new Error('invalid.plan.do.not.exists');

      const downgradeOrUpgrade = planIdIndex < actualSubscriptionPlanIdIndex ? 'DOWNGRADE' : 'UPGRADE';

      if (downgradeOrUpgrade === 'UPGRADE') {
        await this.cancelSubscriptionOnPaymentGatewayUseCase.execute({ id: actualSubscriptionId, accountId });

        const data = { 
          actualSubscriptionId, 
          actualSubscriptionStatus: actualSubscription.status, 
          actualPlanId: actualSubscription.planId, 
          accountId, 
          planId, 
          paymentData: {
            name: customer.data.name,
            token: account.paymentToken,
            docType: customer.data.doc_type,
            docNumber: customer.data.doc_number,
            phone: customer.data.phone,
            ip: paymentData.ip,
          }, 
          customerId: customer.data.id_customer,
        };

        console.log('data: ', data);

        return this.createSubscriptionUseCase.execute(data);
      } else if (downgradeOrUpgrade === 'DOWNGRADE') {
        await this.cancelSubscriptionOnPaymentGatewayUseCase.execute({ id: actualSubscriptionId, accountId, cancelForDowngrade: true, newPlanId: planId });
      }

      
    } catch (error) {
      throw new Error(`Failed to update subscription: ${error.message}`);
    }
  }
}

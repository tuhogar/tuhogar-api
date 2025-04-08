import { Injectable } from '@nestjs/common';
import { ISubscriptionRepository } from 'src/application/interfaces/repositories/subscription.repository.interface';
import { IPaymentGateway } from 'src/application/interfaces/payment-gateway/payment-gateway.interface';
import { Subscription, SubscriptionStatus } from 'src/domain/entities/subscription';
import { IPlanRepository } from 'src/application/interfaces/repositories/plan.repository.interface';
import { UpdateFirebaseUsersDataUseCase } from '../user/update-firebase-users-data.use-case';
import { ConfigService } from '@nestjs/config';

interface UpdateSubscriptionPlanUseCaseCommand {
  actualSubscriptionId: string;
  accountId: string;
  planId: string;
}

@Injectable()
export class UpdateSubscriptionPlanUseCase {
  private readonly firstSubscriptionPlanId: string;
  constructor(
    private readonly updateFirebaseUsersDataUseCase: UpdateFirebaseUsersDataUseCase,
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly planRepository: IPlanRepository,
    private readonly paymentGateway: IPaymentGateway,
    private readonly configService: ConfigService,
  ) {
    this.firstSubscriptionPlanId = this.configService.get<string>('FIRST_SUBSCRIPTION_PLAN_ID');
  }

  async execute({ actualSubscriptionId, accountId, planId }: UpdateSubscriptionPlanUseCaseCommand): Promise<Subscription> {
    const actualSubscription = await this.subscriptionRepository.findOneWithResultIntegrationById(actualSubscriptionId);
    if (!actualSubscription) throw new Error('invalid.subscription.do.not.exists');

    if (actualSubscription.status !== SubscriptionStatus.ACTIVE || actualSubscription.planId === this.firstSubscriptionPlanId) throw new Error('invalid.subscription.do.not.active');

    const plan = await this.planRepository.findOneById(planId);
    if (!plan) throw new Error('invalid.plan.do.not.exists');

    try {
      const externalSubscriptionUpdated = await this.paymentGateway.updateSubscriptionPlan(actualSubscription, plan);
      if (!externalSubscriptionUpdated) throw new Error('error.on.update.subscription');

      const subscriptionUpdated = await this.subscriptionRepository.updatePlan(actualSubscription.id, planId);
      
      await this.updateFirebaseUsersDataUseCase.execute({ accountId });

      return subscriptionUpdated;
    } catch (error) {
      throw new Error(`Failed to update subscription: ${error.message}`);
    }
  }
}

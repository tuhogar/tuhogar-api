import { Injectable } from '@nestjs/common';
import { ISubscriptionRepository } from 'src/application/interfaces/repositories/subscription.repository.interface';
import { IPaymentGateway } from 'src/application/interfaces/payment-gateway/payment-gateway.interface';
import { Subscription, SubscriptionStatus } from 'src/domain/entities/subscription';
import { IPlanRepository } from 'src/application/interfaces/repositories/plan.repository.interface';
import { CreateInternalSubscriptionUseCase } from './create-internal-subscription.use-case';
import { UpdateFirebaseUsersDataUseCase } from '../user/update-firebase-users-data.use-case';
import { ConfigService } from '@nestjs/config';

interface CreateSubscriptionUseCaseCommand {
  actualSubscriptionId: string;
  actualSubscriptionStatus: SubscriptionStatus;
  actualPlanId: string;
  accountId: string;
  email: string;
  planId: string;
  paymentData: Record<string, any>
}

@Injectable()
export class CreateSubscriptionUseCase {
  private readonly firstSubscriptionPlanId: string;
  constructor(
    private readonly createInternalSubscriptionUseCase: CreateInternalSubscriptionUseCase,
    private readonly updateFirebaseUsersDataUseCase: UpdateFirebaseUsersDataUseCase,
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly planRepository: IPlanRepository,
    private readonly paymentGateway: IPaymentGateway,
    private readonly configService: ConfigService,
  ) {
    this.firstSubscriptionPlanId = this.configService.get<string>('FIRST_SUBSCRIPTION_PLAN_ID');
  }

  async execute({ actualSubscriptionId, actualSubscriptionStatus, actualPlanId, accountId, email, planId, paymentData }: CreateSubscriptionUseCaseCommand): Promise<Subscription> {
    if (
      (actualSubscriptionStatus === SubscriptionStatus.ACTIVE || actualSubscriptionStatus === SubscriptionStatus.CREATED) 
      && 
      actualPlanId !== this.firstSubscriptionPlanId) throw new Error('invalid.subscription.exists');

    const plan = await this.planRepository.findOneById(planId);

    const subscriptionCreated = await this.createInternalSubscriptionUseCase.execute({ accountId, planId });

    const externalSubscriptionCreated = await this.paymentGateway.createSubscription(accountId, subscriptionCreated.id, email, plan, paymentData);
    if (!externalSubscriptionCreated) throw new Error('error.on.create.subscription');

    const subscriptionUpdated = await this.subscriptionRepository.updateExternalReferences(subscriptionCreated.id, externalSubscriptionCreated.externalId, externalSubscriptionCreated.externalPayerReference);

    await this.updateFirebaseUsersDataUseCase.execute({ accountId });

    // Se a assinatura atual for a free, deixa criar uma nova como acima e cancela a atual
    if (actualPlanId === this.firstSubscriptionPlanId) await this.subscriptionRepository.cancel(actualSubscriptionId);

    return subscriptionUpdated;
  }
}

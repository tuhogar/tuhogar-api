import { Injectable } from '@nestjs/common';
import { ISubscriptionRepository } from 'src/application/interfaces/repositories/subscription.repository.interface';
import { IPaymentGateway } from 'src/application/interfaces/payment-gateway/payment-gateway.interface';
import { Subscription, SubscriptionStatus } from 'src/domain/entities/subscription';
import { IPlanRepository } from 'src/application/interfaces/repositories/plan.repository.interface';
import { IAccountRepository } from 'src/application/interfaces/repositories/account.repository.interface';

interface CreateInternalSubscriptionUseCaseCommand {
  accountId: string;
  planId: string;
}

@Injectable()
export class CreateInternalSubscriptionUseCase {
  constructor(
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly planRepository: IPlanRepository,
  ) {}

  async execute({ accountId, planId }: CreateInternalSubscriptionUseCaseCommand): Promise<Subscription> {
    const plan = await this.planRepository.findOneById(planId);

    const subscription = new Subscription({
      accountId,
      planId: plan.id, 
      status: SubscriptionStatus.CREATED,
    });
    
    const subscriptionCreated = await this.subscriptionRepository.create(subscription);
    return subscriptionCreated;
  }
}

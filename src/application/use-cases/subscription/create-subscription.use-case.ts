import { Injectable } from '@nestjs/common';
import { ISubscriptionRepository } from 'src/application/interfaces/repositories/subscription.repository.interface';
import { IPaymentGateway } from 'src/application/interfaces/payment-gateway/payment-gateway.interface';
import { Subscription, SubscriptionStatus } from 'src/domain/entities/subscription';
import { IPlanRepository } from 'src/application/interfaces/repositories/plan.repository.interface';
import { IAccountRepository } from 'src/application/interfaces/repositories/account.repository.interface';
import { CreateInternalSubscriptionUseCase } from './create-internal-subscription.use-case';
import { IUserRepository } from 'src/application/interfaces/repositories/user.repository.interface';
import { UpdateFirebaseUsersDataUseCase } from '../user/update-firebase-users-data.use-case';

interface CreateSubscriptionUseCaseCommand {
  accountId: string;
  email: string;
  planId: string;
  paymentData: Record<string, any>
}

@Injectable()
export class CreateSubscriptionUseCase {
  constructor(
    private readonly createInternalSubscriptionUseCase: CreateInternalSubscriptionUseCase,
    private readonly updateFirebaseUsersDataUseCase: UpdateFirebaseUsersDataUseCase,
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly planRepository: IPlanRepository,
    private readonly paymentGateway: IPaymentGateway,
  ) {}

  async execute({ accountId, email, planId, paymentData }: CreateSubscriptionUseCaseCommand): Promise<Subscription> {
    const subscriptionActual = await this.subscriptionRepository.findActiveOrCreatedByAccountId(accountId);
    let subscriptionActualIsPlanZero = false;
    if (subscriptionActual) {
      const planActual = await this.planRepository.findById(subscriptionActual.planId);

      // Precisa cancelar uma assinatura antes de criar uma outra
      if (planActual && planActual.price > 0) throw new Error('invalid.subscription.exists');
      subscriptionActualIsPlanZero = true;
    }

    const plan = await this.planRepository.findById(planId);

    const subscriptionCreated = await this.createInternalSubscriptionUseCase.execute({ accountId, planId });

    const externalSubscriptionCreated = await this.paymentGateway.createSubscription(accountId, subscriptionCreated.id, email, plan, paymentData);
    if (!externalSubscriptionCreated) throw new Error('error.on.create.subscription');

    const subscriptionUpdated = await this.subscriptionRepository.updateExternalReferences(subscriptionCreated.id, externalSubscriptionCreated.externalId, externalSubscriptionCreated.externalPayerReference);

    await this.updateFirebaseUsersDataUseCase.execute({ accountId });

    // Se a assinatura atual for a free, deixa criar uma nova como acima e cancela a atual
    if (subscriptionActualIsPlanZero) await this.subscriptionRepository.cancel(subscriptionActual.id);

    return subscriptionUpdated;
  }
}

import { Injectable } from '@nestjs/common';
import { ISubscriptionRepository } from 'src/application/interfaces/repositories/subscription.repository.interface';
import { IPaymentGateway } from 'src/application/interfaces/payment-gateway/payment-gateway.interface';
import { Subscription, SubscriptionStatus } from 'src/domain/entities/subscription';
import { IPlanRepository } from 'src/application/interfaces/repositories/plan.repository.interface';
import { UpdateFirebaseUsersDataUseCase } from '../user/update-firebase-users-data.use-case';
import { ConfigService } from '@nestjs/config';
import { IAccountRepository } from 'src/application/interfaces/repositories/account.repository.interface';

interface UpdateSubscriptionVipPlanUseCaseCommand {
  accountId: string;
  planId: string;
  nextPaymentDate?: string;
}

@Injectable()
export class UpdateSubscriptionVipPlanUseCase {
  constructor(
    private readonly updateFirebaseUsersDataUseCase: UpdateFirebaseUsersDataUseCase,
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly planRepository: IPlanRepository,
    private readonly accountRepository: IAccountRepository,
      ) {}

  async execute({ accountId, planId, nextPaymentDate }: UpdateSubscriptionVipPlanUseCaseCommand): Promise<Subscription> {
    // Busca a assinatura mais recente do usuário
    const subscription = await this.subscriptionRepository.findMostRecentByAccountId(accountId);
    
    // Se não encontrou assinatura, lança um erro
    if (!subscription) {
      throw new Error('notfound.subscription.do.not.exists');
    }

    const plan = await this.planRepository.findOneById(planId);
    if (!plan) throw new Error('invalid.plan.do.not.exists');

    try {
      const subscriptionUpdated = await this.subscriptionRepository.updatePlan(subscription.id, planId);
      if (nextPaymentDate) {
        await this.subscriptionRepository.updateNextPaymentDate(subscriptionUpdated.id, new Date(Date.UTC(parseInt(nextPaymentDate.substring(0, 4)), parseInt(nextPaymentDate.substring(4, 6)) - 1, parseInt(nextPaymentDate.substring(6, 8)))));
      }

      await this.accountRepository.updatePlan(accountId, planId);
      
      await this.updateFirebaseUsersDataUseCase.execute({ accountId });

      return subscriptionUpdated;
    } catch (error) {
      throw new Error(`Failed to update subscription: ${error.message}`);
    }
  }
}

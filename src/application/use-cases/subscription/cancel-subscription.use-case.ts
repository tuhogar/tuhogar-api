import { Injectable } from '@nestjs/common';
import { ISubscriptionRepository } from 'src/application/interfaces/repositories/subscription.repository.interface';
import { IPaymentGateway } from 'src/application/interfaces/payment-gateway/payment-gateway.interface';
import { SubscriptionStatus } from 'src/domain/entities/subscription';
import { CreateInternalSubscriptionUseCase } from './create-internal-subscription.use-case';
import { ConfigService } from '@nestjs/config';
import { UpdateFirebaseUsersDataUseCase } from '../user/update-firebase-users-data.use-case';

interface CancelSubscriptionUseCaseCommand {
  id: string;
  accountId: string;
}

@Injectable()
export class CancelSubscriptionUseCase {
  private readonly firstSubscriptionPlanId: string;
  constructor(
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly paymentGateway: IPaymentGateway,
    private readonly createInternalSubscriptionUseCase: CreateInternalSubscriptionUseCase,
    private readonly updateFirebaseUsersDataUseCase: UpdateFirebaseUsersDataUseCase,
    private readonly configService: ConfigService,
  ){
    this.firstSubscriptionPlanId = this.configService.get<string>('FIRST_SUBSCRIPTION_PLAN_ID');
  }

  async execute({ id, accountId }: CancelSubscriptionUseCaseCommand): Promise<void> {
      const subscription = await this.subscriptionRepository.findOneById(id);
      if (!subscription || subscription.status !== SubscriptionStatus.ACTIVE) throw new Error('error.subscription.do.not.exists');

      const externalSubscriptionCanceled = await this.paymentGateway.cancelSubscription(subscription.externalId);
      if (!externalSubscriptionCanceled) throw new Error('error.subscription.cancel.failed');

      await this.subscriptionRepository.cancel(id);

      const subscriptionCreated = await this.createInternalSubscriptionUseCase.execute({ accountId, planId: this.firstSubscriptionPlanId });
      await this.subscriptionRepository.active(subscriptionCreated.id);
      await this.updateFirebaseUsersDataUseCase.execute({ accountId });
  }
}

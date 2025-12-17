import { Injectable } from '@nestjs/common';
import { ISubscriptionRepository } from 'src/application/interfaces/repositories/subscription.repository.interface';
import { IPaymentGateway } from 'src/application/interfaces/payment-gateway/payment-gateway.interface';
import { Subscription, SubscriptionStatus } from 'src/domain/entities/subscription';
import { IPlanRepository } from 'src/application/interfaces/repositories/plan.repository.interface';
import { CreateInternalSubscriptionUseCase } from './create-internal-subscription.use-case';
import { UpdateFirebaseUsersDataUseCase } from '../user/update-firebase-users-data.use-case';
import { ConfigService } from '@nestjs/config';
import { IUserRepository } from 'src/application/interfaces/repositories/user.repository.interface';
import { RemoveInternalSubscriptionUseCase } from './remove-internal-subscription.use-case';
import { IAccountRepository } from 'src/application/interfaces/repositories/account.repository.interface';
import { AccountDocumentType } from 'src/domain/entities/account';
import { PathAccountUseCase } from '../account/path-account.use-case';
import { UserRole } from 'src/domain/entities/user';
import { Coupon, CouponType } from 'src/domain/entities/coupon';
import { IAccountCouponRepository } from 'src/application/interfaces/repositories/account-coupon.repository.interface';

interface CreateSubscriptionUseCaseCommand {
  actualSubscriptionId: string;
  actualSubscriptionStatus: SubscriptionStatus;
  actualPlanId: string;
  accountId: string;
  planId: string;
  paymentData: Record<string, any>
}

@Injectable()
export class CreateSubscriptionUseCase {
  private readonly firstSubscriptionPlanId: string;
  constructor(
    private readonly createInternalSubscriptionUseCase: CreateInternalSubscriptionUseCase,
    private readonly removeInternalSubscriptionUseCase: RemoveInternalSubscriptionUseCase,
    private readonly updateFirebaseUsersDataUseCase: UpdateFirebaseUsersDataUseCase,
    private readonly pathAccountUseCase: PathAccountUseCase,
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly planRepository: IPlanRepository,
    private readonly userRepository: IUserRepository,
    private readonly paymentGateway: IPaymentGateway,
    private readonly configService: ConfigService,
    private readonly accountRepository: IAccountRepository,
    private readonly accountCouponRepository: IAccountCouponRepository,
  ) {
    this.firstSubscriptionPlanId = this.configService.get<string>('FIRST_SUBSCRIPTION_PLAN_ID');
  }

  async execute({ actualSubscriptionId, actualSubscriptionStatus, actualPlanId, accountId, planId, paymentData }: CreateSubscriptionUseCaseCommand): Promise<Subscription> {
    const account = await this.accountRepository.findOneById(accountId);
    const plan = await this.planRepository.findOneById(planId);
    //const user = await this.userRepository.findOneById(userId);

    if (account.hasPaidPlan && plan.freeTrialDays > 0) throw new Error('invalid.subscription.plan');

    const accountCoupon = await this.accountCouponRepository.findLastNotDepletedByAccountId(accountId);
    const coupon = accountCoupon?.coupon;
    let setCouponDepleted = false;
    if (coupon) {
      if (coupon.expirationDate && coupon.expirationDate < new Date()) throw new Error('invalid.coupon.expiredDate');
      //if (account.hasPaidPlan && !coupon.hasPaidPlanIds.some((plan) => plan.id === planId)) throw new Error('invalid.subscription.plan');
      //if (!account.hasPaidPlan && !coupon.doesNotHavePaidPlanIds.some((plan) => plan.id === planId)) throw new Error('invalid.subscription.plan');
      if (!coupon.allowRepeatedFulfillment) setCouponDepleted = true;
    }
    if (plan.discount && !coupon) throw new Error('invalid.subscription.plan');

    const subscriptionCreated = await this.createInternalSubscriptionUseCase.execute({ accountId, planId });

    try {
      const externalSubscriptionCreated = await this.paymentGateway.createSubscription(accountId, subscriptionCreated.id, account.email, account.name, plan, paymentData);
      if (!externalSubscriptionCreated) throw new Error('error.subscription.create.failed');

      // A data do próximo pagamento já vem definida pelo gateway de pagamento (ePayco)
      // através do campo nextVerificationDate
      const subscriptionUpdated = await this.subscriptionRepository.updateExternalReferences(
        subscriptionCreated.id, 
        externalSubscriptionCreated.externalId, 
        externalSubscriptionCreated.externalPayerReference, 
        externalSubscriptionCreated.resultIntegration, 
        externalSubscriptionCreated.status,
        externalSubscriptionCreated.nextPaymentDate
      );
      await this.updateFirebaseUsersDataUseCase.execute({ accountId });
      await this.accountRepository.updatePlan(accountId, planId);

      // Cancela a assinatura atual
      await this.subscriptionRepository.cancel(actualSubscriptionId);
      
      // Marcar a conta como tendo assinado um plano pago
      if (planId !== this.firstSubscriptionPlanId) {
        await this.accountRepository.updateHasPaidPlan(accountId, true);
        console.log(`Conta ${accountId} marcada como tendo assinado um plano pago`);
      }

      if (setCouponDepleted) await this.accountCouponRepository.deplete(accountCoupon.id);

      return subscriptionUpdated;
    } catch (error) {
      console.log('-------------error-on-create-subscription-------------');
      console.log(error);
      console.log('-------------error-on-create-subscription-------------');
      await this.removeInternalSubscriptionUseCase.execute({ id: subscriptionCreated.id });
      throw error;
    }
  }
}

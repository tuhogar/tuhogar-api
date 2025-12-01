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
    console.log('---subscription-1');
    if (
      (actualSubscriptionStatus === SubscriptionStatus.ACTIVE || actualSubscriptionStatus === SubscriptionStatus.CREATED) 
      && 
      actualPlanId !== this.firstSubscriptionPlanId) throw new Error('error.subscription.exists');

    console.log('---subscription-2');
    const account = await this.accountRepository.findOneById(accountId);
    console.log('---subscription-3');
    const plan = await this.planRepository.findOneById(planId);
    console.log('---subscription-4');
    //const user = await this.userRepository.findOneById(userId);
    console.log('---subscription-5');

    if (account.hasPaidPlan && plan.freeTrialDays > 0) throw new Error('invalid.subscription.plan');
    console.log('---subscription-6');

    const accountCoupon = await this.accountCouponRepository.findLastNotDepletedByAccountId(accountId);
    console.log('---subscription-7');
    const coupon = accountCoupon?.coupon;
    console.log('---subscription-8');
    let setCouponDepleted = false;
    console.log('---subscription-9');
    if (coupon) {
      console.log('---subscription-10');
      if (coupon.expirationDate && coupon.expirationDate < new Date()) throw new Error('invalid.coupon.expiredDate');
      console.log('---subscription-11');
      //if (account.hasPaidPlan && !coupon.hasPaidPlanIds.some((plan) => plan.id === planId)) throw new Error('invalid.subscription.plan');
      console.log('---subscription-12');
      //if (!account.hasPaidPlan && !coupon.doesNotHavePaidPlanIds.some((plan) => plan.id === planId)) throw new Error('invalid.subscription.plan');
      console.log('---subscription-13');
      if (!coupon.allowRepeatedFulfillment) setCouponDepleted = true;
      console.log('---subscription-14');
    }
    console.log('---subscription-15');
    if (plan.discount && !coupon) throw new Error('invalid.subscription.plan');
    console.log('---subscription-16');

    const subscriptionCreated = await this.createInternalSubscriptionUseCase.execute({ accountId, planId });
    console.log('---subscription-17');

    try {
      console.log('---subscription-18');
      const externalSubscriptionCreated = await this.paymentGateway.createSubscription(accountId, subscriptionCreated.id, account.email, account.name, plan, paymentData);
      console.log('---subscription-19');
      if (!externalSubscriptionCreated) throw new Error('error.subscription.create.failed');
      console.log('---subscription-20');

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
      console.log('---subscription-21');
      await this.updateFirebaseUsersDataUseCase.execute({ accountId });
      console.log('---subscription-22');
      await this.accountRepository.updatePlan(accountId, planId);
      console.log('---subscription-23');

      // Se a assinatura atual for a free, deixa criar uma nova como acima e cancela a atual
      if (actualPlanId === this.firstSubscriptionPlanId) await this.subscriptionRepository.cancel(actualSubscriptionId);
      console.log('---subscription-24');
      
      // Marcar a conta como tendo assinado um plano pago
      if (planId !== this.firstSubscriptionPlanId) {
        console.log('---subscription-25');
        await this.accountRepository.updateHasPaidPlan(accountId, true);
        console.log('---subscription-26');
        console.log(`Conta ${accountId} marcada como tendo assinado um plano pago`);
      }
      console.log('---subscription-27');

      if (setCouponDepleted) await this.accountCouponRepository.deplete(accountCoupon.id);
      console.log('---subscription-28');

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

import { Injectable } from '@nestjs/common';
import { ISubscriptionRepository } from 'src/application/interfaces/repositories/subscription.repository.interface';
import { IPaymentGateway } from 'src/application/interfaces/payment-gateway/payment-gateway.interface';
import { Subscription, SubscriptionStatus } from 'src/domain/entities/subscription';
import { IPlanRepository } from 'src/application/interfaces/repositories/plan.repository.interface';
import { ISubscriptionPaymentRepository } from 'src/application/interfaces/repositories/subscription-payment.repository.interface';
import { SubscriptionPayment, SubscriptionPaymentStatus } from 'src/domain/entities/subscription-payment';
import { ISubscriptionNotificationRepository } from 'src/application/interfaces/repositories/subscription-notification.repository.interface';
import { SubscriptionNotification, SubscriptionNotificationAction, SubscriptionNotificationType } from 'src/domain/entities/subscription-notification';
import { ExternalSubscriptionPaymentStatus } from 'src/domain/entities/external-subscription-payment';
import { UpdateFirebaseUsersDataUseCase } from '../user/update-firebase-users-data.use-case';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ReceiveSubscriptionPaymentNotificationUseCase {
  private readonly firstSubscriptionPlanId: string;
  constructor(
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly subscriptionPaymentRepository: ISubscriptionPaymentRepository,
    private readonly subscriptionNotificationRepository: ISubscriptionNotificationRepository,
    private readonly paymentGateway: IPaymentGateway,
    private readonly updateFirebaseUsersDataUseCase: UpdateFirebaseUsersDataUseCase,
    private readonly configService: ConfigService,
  ) {
    this.firstSubscriptionPlanId = this.configService.get<string>('FIRST_SUBSCRIPTION_PLAN_ID');
  }

  async execute(subscriptionNotification: SubscriptionNotification): Promise<void> {
    const paymentNotificated = await this.paymentGateway.getPayment(subscriptionNotification);
    if (!paymentNotificated) {
      console.log('NAO ENCONTROU O PAGAMENTO NO SERVICO EXTERNO');
      throw new Error('notfound.payment.notificated.do.not.exists');
    }

    let subscription: Subscription;
    if (paymentNotificated.externalSubscriptionReference) {
      subscription = await this.subscriptionRepository.findOneByExternalId(paymentNotificated.externalSubscriptionReference);
    } else if (paymentNotificated.externalPayerReference) {
      subscription = await this.subscriptionRepository.findOneByExternalPayerReference(paymentNotificated.externalPayerReference);
    }

    if (!subscription) {
      console.log('NAO ENCONTROU A ASSINATURA DO PAGAMENTO NA BASE DE DADOS');
    } else {
      paymentNotificated.subscriptionId = subscription.id;
      paymentNotificated.accountId = subscription.accountId;
    }

    const payment = await this.subscriptionPaymentRepository.findOneByExternalId(paymentNotificated.externalId);

    if (subscriptionNotification.action === SubscriptionNotificationAction.CREATE && !payment) {
      console.log('CRIA PAGAMENTO');
      await this.subscriptionPaymentRepository.create(paymentNotificated);
    } else {
      if (!payment) {
        console.log('NAO ENCONTROU O PAGAMENTO NA BASE DE DADOS');
        throw new Error('notfound.payment.do.not.exists');
      }

      console.log('ATUALIZA PAGAMENTO');
      await this.subscriptionPaymentRepository.update(payment.id, paymentNotificated);
    }

    if (paymentNotificated.status === SubscriptionPaymentStatus.APPROVED && subscription.status !== SubscriptionStatus.ACTIVE && subscription.status !== SubscriptionStatus.CANCELLED) {
      console.log('ATIVA ASSINATURA');
      await this.subscriptionRepository.active(subscription.id);
      await this.updateFirebaseUsersDataUseCase.execute({ accountId: subscription.accountId });

      const actualSubscription = await this.subscriptionRepository.findOneActiveByAccountId(subscription.accountId);

      // Se a assinatura atual for a free, deixa criar uma nova como acima e cancela a atual
      if (actualSubscription && actualSubscription.planId === this.firstSubscriptionPlanId) await this.subscriptionRepository.cancel(actualSubscription.id);
    }
  }
}

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
  private readonly subscriptionTotalDays: number;
  constructor(
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly subscriptionPaymentRepository: ISubscriptionPaymentRepository,
    private readonly subscriptionNotificationRepository: ISubscriptionNotificationRepository,
    private readonly paymentGateway: IPaymentGateway,
    private readonly updateFirebaseUsersDataUseCase: UpdateFirebaseUsersDataUseCase,
    private readonly configService: ConfigService,
  ) {
    this.firstSubscriptionPlanId = this.configService.get<string>('FIRST_SUBSCRIPTION_PLAN_ID');
    // Garantir que a variável de ambiente seja convertida para número
    const subscriptionTotalDays = this.configService.get<string>('SUBSCRIPTION_TOTAL_DAYS');
    this.subscriptionTotalDays = subscriptionTotalDays ? parseInt(subscriptionTotalDays, 10) : 30; // Valor padrão de 30 dias se não for definido
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

    if (paymentNotificated.status === SubscriptionPaymentStatus.APPROVED) {
      if (subscription.status !== SubscriptionStatus.ACTIVE && subscription.status !== SubscriptionStatus.CANCELLED && subscription.status !== SubscriptionStatus.CANCELLED_ON_PAYMENT_GATEWAY) {
        console.log('ATIVA ASSINATURA');
        await this.subscriptionRepository.active(subscription.id);
        await this.updateFirebaseUsersDataUseCase.execute({ accountId: subscription.accountId });

        const actualSubscription = await this.subscriptionRepository.findOneActiveByAccountId(subscription.accountId);

        // Se a assinatura atual for a free, cancela a atual
        if (actualSubscription && actualSubscription.planId === this.firstSubscriptionPlanId) await this.subscriptionRepository.cancel(actualSubscription.id);
      }

      // Gravar a data do pagamento na assinatura
      if (paymentNotificated.paymentDate && subscription) {
        console.log(`Atualizando data de pagamento da assinatura ${subscription.id}`);
        await this.subscriptionRepository.updatePaymentDate(subscription.id, paymentNotificated.paymentDate);
        
        // Calcular e gravar a data do próximo pagamento (paymentDate + 30 dias)
        const nextPaymentDate = new Date(paymentNotificated.paymentDate);
        nextPaymentDate.setDate(nextPaymentDate.getDate() + this.subscriptionTotalDays);
        console.log(`Atualizando data do próximo pagamento da assinatura ${subscription.id} para ${nextPaymentDate.toISOString()}`);
        await this.subscriptionRepository.updateNextPaymentDate(subscription.id, nextPaymentDate);
      }
    }
  }
}

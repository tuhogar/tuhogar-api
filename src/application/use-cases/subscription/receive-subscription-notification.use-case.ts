import { Injectable } from '@nestjs/common';
import { ISubscriptionRepository } from 'src/application/interfaces/repositories/subscription.repository.interface';
import { IPaymentGateway } from 'src/application/interfaces/payment-gateway/payment-gateway.interface';
import { ISubscriptionNotificationRepository } from 'src/application/interfaces/repositories/subscription-notification.repository.interface';
import { SubscriptionNotification, SubscriptionNotificationAction, SubscriptionNotificationType } from 'src/domain/entities/subscription-notification';
import { ReceiveSubscriptionInvoiceNotificationUseCase } from './receive-subscription-invoice-notification.use-case';
import { ReceiveSubscriptionPaymentNotificationUseCase } from './receive-subscription-payment-notification.use-case';
import { SubscriptionStatus } from 'src/domain/entities/subscription';

@Injectable()
export class ReceiveSubscriptionNotificationUseCase {
  constructor(
    private readonly receiveSubscriptionInvoiceNotificationUseCase: ReceiveSubscriptionInvoiceNotificationUseCase,
    private readonly receiveSubscriptionPaymentNotificationUseCase: ReceiveSubscriptionPaymentNotificationUseCase,
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly subscriptionNotificationRepository: ISubscriptionNotificationRepository,
    private readonly paymentGateway: IPaymentGateway,
  ) {}

  async execute(payload: any): Promise<void> {
    const subscriptionNotification = await this.getSubscriptionNotification(payload);

    switch(subscriptionNotification.type) {
      case SubscriptionNotificationType.SUBSCRIPTION:
        await this.receiveSubscriptionNotification(subscriptionNotification);
        break;
      case SubscriptionNotificationType.PAYMENT:
        await this.receiveSubscriptionPaymentNotificationUseCase.execute(subscriptionNotification);
        break;
      case SubscriptionNotificationType.INVOICE:
        await this.receiveSubscriptionInvoiceNotificationUseCase.execute(subscriptionNotification);
        break;
      default:
        break;
    }
  }

  async receiveSubscriptionNotification(subscriptionNotification: SubscriptionNotification): Promise<void> {
    const subscriptionNotificated = await this.paymentGateway.getSubscription(subscriptionNotification);

    if (!subscriptionNotificated) {
      console.log('NAO ENCONTROU A ASSINATURA NO SERVICO EXTERNO');
      throw new Error('notfound.subscription.notificated.do.not.exists');
    }

    const subscription = await this.subscriptionRepository.findByExternalId(subscriptionNotificated.externalId);
    if (!subscription) {
      console.log('NAO ENCONTROU A ASSINATURA NA BASE DE DADOS');
      throw new Error('notfound.subscription.do.not.exists');
    }
    
    if (subscriptionNotification.action == SubscriptionNotificationAction.UPDATE) {
      switch (subscriptionNotificated.status) {
        case SubscriptionStatus.CANCELLED:
            console.log('CANCELA A ASSINATURA');
            await this.subscriptionRepository.cancel(subscription.id);
            // TODO: Volta account para o plano gratuíto
            break;
        case SubscriptionStatus.ACTIVE:
            console.log('ATIVA A ASSINATURA');
            await this.subscriptionRepository.active(subscription.id);
            break;
        case SubscriptionStatus.PAUSED:
            console.log('PAUSA A ASSINATURA');
            await this.subscriptionRepository.pause(subscription.id);
            // TODO: Verificar o que fazer
            // Por exemplo, precisaremos ter uma verificação para depois de x dias cancelar?
            // O mesmo devemos verificar como fazer para pagamentos recusados.
            break;
        case SubscriptionStatus.PENDING:
            console.log('MUDA A ASSINATURA PARA PENDENTE');
            await this.subscriptionRepository.pending(subscription.id);
            // TODO: Verificar o que fazer
            // Por exemplo, precisaremos ter uma verificação para depois de x dias cancelar?
            // O mesmo devemos verificar como fazer para pagamentos recusados.
            break;
        default:
            break;
      }
    }
  }

  async getSubscriptionNotification(payload: any): Promise<SubscriptionNotification> {
    const subscriptionNotification = await this.paymentGateway.getSubscriptionNotification(payload);
    const subscriptionNotificationCreated = await this.subscriptionNotificationRepository.create(subscriptionNotification);

    return subscriptionNotificationCreated;
  }
}

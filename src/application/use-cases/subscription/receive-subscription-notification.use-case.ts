import { Injectable } from '@nestjs/common';
import { ISubscriptionRepository } from 'src/application/interfaces/repositories/subscription.repository.interface';
import { IPaymentGateway } from 'src/application/interfaces/payment-gateway/payment-gateway.interface';
import { ISubscriptionNotificationRepository } from 'src/application/interfaces/repositories/subscription-notification.repository.interface';
import { SubscriptionNotification, SubscriptionNotificationAction, SubscriptionNotificationType } from 'src/domain/entities/subscription-notification';
import { ReceiveSubscriptionInvoiceNotificationUseCase } from './receive-subscription-invoice-notification.use-case';
import { ReceiveSubscriptionPaymentNotificationUseCase } from './receive-subscription-payment-notification.use-case';
import { ExternalSubscriptionStatus } from 'src/domain/entities/external-subscription';

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
    const notification = this.paymentGateway.getSubscriptionNotification(payload);

    const subscriptionNotification = await this.subscriptionNotificationRepository.create(notification);

    switch(subscriptionNotification.type) {
      case SubscriptionNotificationType.INVOICE:
        await this.receiveSubscriptionInvoiceNotificationUseCase.execute(subscriptionNotification);
        break;
      case SubscriptionNotificationType.PAYMENT:
        await this.receiveSubscriptionPaymentNotificationUseCase.execute(subscriptionNotification);
        break;
      case SubscriptionNotificationType.SUBSCRIPTION:
        await this.receiveSubscriptionNotification(subscriptionNotification);
        break;
      default:
        break;
    }
  }

  async receiveSubscriptionNotification(subscriptionNotification: SubscriptionNotification): Promise<void> {
    console.log('--------receive-subscription-notification-INICIO');
    if (!subscriptionNotification.externalId) throw new Error('invalid.notification.externalId');

    const subscription = await this.subscriptionRepository.findByExternalId(subscriptionNotification.externalId);
    if (!subscription) {
      console.log('NAO ENCONTROU A ASSINATURA NA BASE DE DADOS');
      throw new Error('notfound.subscription.do.not.exists');
    }
    

    // TODO: Abaixo, deverá ser retornado um objeto subscription
    // para atualizar as propriedades modificadas na subscription já existente na base de dados
    // trocar paymentGateway.getExternalSubscription() para paymentGateway.getSubscription()
    const externalSubscription = await this.paymentGateway.getExternalSubscription(subscriptionNotification.externalId);
    if (!externalSubscription) {
      console.log('NAO ENCONTROU A ASSINATURA NO SERVICO EXTERNO');
      throw new Error('notfound.external.subscription.do.not.exists')
    }

    console.log('-----externalSubscription');
    console.log(externalSubscription);
    console.log('-----externalSubscription');
    
    // TODO: Retornar a notificação pronta, com o objeto externo (subscription, payment ou invoice)
    // primeira linha do método execute() acima
    await this.subscriptionNotificationRepository.addSubscription(subscriptionNotification.id, externalSubscription.payload);
    
    if (subscriptionNotification.action == SubscriptionNotificationAction.UPDATE) {
      switch (externalSubscription.status) {
        case ExternalSubscriptionStatus.CANCELLED:
            console.log('CANCELA A ASSINATURA');
            await this.subscriptionRepository.cancel(subscription.id);
            // TODO: Volta account para o plano gratuíto
            break;
        case ExternalSubscriptionStatus.ACTIVE:
            console.log('ATIVA A ASSINATURA');
            await this.subscriptionRepository.active(subscription.id);
            break;
        case ExternalSubscriptionStatus.PAUSED:
            console.log('PAUSA A ASSINATURA');
            await this.subscriptionRepository.pause(subscription.id);
            // TODO: Verificar o que fazer
            // Por exemplo, precisaremos ter uma verificação para depois de x dias cancelar?
            // O mesmo devemos verificar como fazer para pagamentos recusados.
            break;
        case ExternalSubscriptionStatus.PENDING:
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
    console.log('--------receive-subscription-notification-FIM');
  }

  
}

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

@Injectable()
export class ReceiveSubscriptionPaymentNotificationUseCase {
  constructor(
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly subscriptionPaymentRepository: ISubscriptionPaymentRepository,
    private readonly subscriptionNotificationRepository: ISubscriptionNotificationRepository,
    private readonly paymentGateway: IPaymentGateway,
  ) {}

  async execute(subscriptionNotification: SubscriptionNotification): Promise<void> {
    console.log('--------receive-subscription-payment-notification-INICIO');
    if (!subscriptionNotification.externalId) throw new Error('invalid.notification.externalId');
    
    // TODO: Abaixo, deverá ser retornado um objeto payment
    // para atualizar as propriedades modificadas no payment já existente na base de dados ou criar um novo
    // trocar paymentGateway.getExternalPayment() para paymentGateway.getPayment()
    const externalPayment = await this.paymentGateway.getExternalPayment(subscriptionNotification.externalId);
    if (!externalPayment) {
      console.log('NAO ENCONTROU O PAGAMENTO NO SERVICO EXTERNO');
      throw new Error('notfound.external.payment.do.not.exists')
    }

    console.log('-----externalPayment');
    console.log(externalPayment);
    console.log('-----externalPayment');

    await this.subscriptionNotificationRepository.addPayment(subscriptionNotification.id, externalPayment.payload);

    // TODO: Buscar por externalSubscriptionReference (externalId da subscription) se existir, se não existir, buscar por externalPayerReference da subscription (externalId do payment)
    const subscription = await this.subscriptionRepository.findByExternalPayerReference(externalPayment.payload.payer.id);
    if (!subscription) {
      console.log('NAO ENCONTROU A ASSINATURA DO PAGAMENTO NA BASE DE DADOS');
      throw new Error('notfound.subscription.do.not.exists');
    }

    let status = SubscriptionPaymentStatus.PENDING;

    switch (externalPayment.status) {
      case ExternalSubscriptionPaymentStatus.PENDING:
        status = SubscriptionPaymentStatus.PENDING;
        break;
      case ExternalSubscriptionPaymentStatus.APPROVED:
        status = SubscriptionPaymentStatus.APPROVED;
        break;
      case ExternalSubscriptionPaymentStatus.AUTHORIZED:
        status = SubscriptionPaymentStatus.AUTHORIZED;
        break;
      case ExternalSubscriptionPaymentStatus.IN_PROCESS:
        status = SubscriptionPaymentStatus.IN_PROCESS;
        break;
      case ExternalSubscriptionPaymentStatus.IN_MEDIATION:
        status = SubscriptionPaymentStatus.IN_MEDIATION;
        break;
      case ExternalSubscriptionPaymentStatus.REJECTED:
        status = SubscriptionPaymentStatus.REJECTED;
        break;
      case ExternalSubscriptionPaymentStatus.CANCELLED:
        status = SubscriptionPaymentStatus.CANCELLED;
        break;
      case ExternalSubscriptionPaymentStatus.REFUNDED:
        status = SubscriptionPaymentStatus.REFUNDED;
        break;
      case ExternalSubscriptionPaymentStatus.CHARGED_BACK:
        status = SubscriptionPaymentStatus.CHARGED_BACK;
        break;
    }

    //if (externalSubscriptionNotification.action === ExternalSubscriptionNotificationAction.CREATE) {
      const subscriptionPayment = new SubscriptionPayment({
        subscriptionId: subscription.id,
        accountId: subscription.accountId,
        externalId: externalPayment.id,
        paymentAt: null,
        approvedAt: externalPayment.payload.date_approved,
        type: externalPayment.payload.payment_type_id,
        method: externalPayment.payload.payment_method_id,
        description: externalPayment.payload.description,
        amount: externalPayment.payload.transaction_amount,
        currency: externalPayment.payload.currency_id,
        status,
      });

      console.log('-----subscriptionPayment');
      console.log(subscriptionPayment);
      console.log('-----subscriptionPayment');

      await this.subscriptionPaymentRepository.create(subscriptionPayment);
    //}

    // TODO: Faça alguma coisa com a notificação recebida sobre o pagamento
    console.log('--------receive-external-subscription-payment-notification-FIM');
  }
}

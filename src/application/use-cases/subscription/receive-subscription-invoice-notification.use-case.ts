import { Injectable } from '@nestjs/common';
import { ISubscriptionRepository } from 'src/application/interfaces/repositories/subscription.repository.interface';
import { IPaymentGateway } from 'src/application/interfaces/payment-gateway/payment-gateway.interface';
import { Subscription, SubscriptionStatus } from 'src/domain/entities/subscription';
import { IPlanRepository } from 'src/application/interfaces/repositories/plan.repository.interface';
import { ISubscriptionPaymentRepository } from 'src/application/interfaces/repositories/subscription-payment.repository.interface';
import { SubscriptionPaymentStatus } from 'src/domain/entities/subscription-payment';
import { ISubscriptionNotificationRepository } from 'src/application/interfaces/repositories/subscription-notification.repository.interface';
import { SubscriptionNotification, SubscriptionNotificationAction } from 'src/domain/entities/subscription-notification';
import { SubscriptionInvoice, SubscriptionInvoiceStatus } from 'src/domain/entities/subscription-invoice';
import { ExternalSubscriptionInvoiceStatus } from 'src/domain/entities/external-subscription-invoice';
import { ISubscriptionInvoiceRepository } from 'src/application/interfaces/repositories/subscription-invoice.repository.interface';

@Injectable()
export class ReceiveSubscriptionInvoiceNotificationUseCase {
  constructor(
    private readonly subscriptionRepository: ISubscriptionRepository,
    private readonly subscriptionInvoiceRepository: ISubscriptionInvoiceRepository,
    private readonly subscriptionNotificationRepository: ISubscriptionNotificationRepository,
    private readonly paymentGateway: IPaymentGateway,
  ) {}

  async execute(subscriptionNotification: SubscriptionNotification): Promise<void> {
    console.log('--------receive-subscription-invoice-notification-INICIO');
    if (!subscriptionNotification.externalId) throw new Error('invalid.notification.externalId');
    
    // TODO: Abaixo, deverá ser retornado um objeto invoice
    // para atualizar as propriedades modificadas na invoice já existente na base de dados ou criar uma nova
    // trocar paymentGateway.getExternalInvoice() para paymentGateway.getInvoice()
    const externalInvoice = await this.paymentGateway.getExternalInvoice(subscriptionNotification.externalId);
    if (!externalInvoice) {
      console.log('NAO ENCONTROU A INVOICE NO SERVICO EXTERNO');
      throw new Error('notfound.external.invoice.do.not.exists')
    }

    console.log('-----externalInvoice');
    console.log(externalInvoice);
    console.log('-----externalInvoice');

    await this.subscriptionNotificationRepository.addInvoice(subscriptionNotification.id, externalInvoice.payload);

    // TODO: Buscar por externalSubscriptionReference (externalId da subscription)
    const subscription = await this.subscriptionRepository.findByExternalId(externalInvoice.payload.preapproval_id);
    if (!subscription) {
      console.log('NAO ENCONTROU A ASSINATURA DA FATURA NA BASE DE DADOS');
      throw new Error('notfound.subscription.do.not.exists');
    }

    let status = SubscriptionInvoiceStatus.SCHEDULED;

    switch (externalInvoice.status) {
      case ExternalSubscriptionInvoiceStatus.SCHEDULED:
        status = SubscriptionInvoiceStatus.SCHEDULED;
        break;
      case ExternalSubscriptionInvoiceStatus.PROCESSED:
        status = SubscriptionInvoiceStatus.PROCESSED;
        break;
      case ExternalSubscriptionInvoiceStatus.RECYCLING:
        status = SubscriptionInvoiceStatus.RECYCLING;
        break;
      case ExternalSubscriptionInvoiceStatus.CANCELLED:
        status = SubscriptionInvoiceStatus.CANCELLED;
        break;
    }

    //if (externalSubscriptionNotification.action === ExternalSubscriptionNotificationAction.CREATE) {
      const subscriptionInvoice = new SubscriptionInvoice({
        subscriptionId: subscription.id,
        accountId: subscription.accountId,
        externalId: externalInvoice.id,
        description: externalInvoice.payload.type,
        amount: externalInvoice.payload.transaction_amount,
        currency: externalInvoice.payload.currency_id,
        status,
      });

      console.log('-----subscriptionInvoice');
      console.log(subscriptionInvoice);
      console.log('-----subscriptionInvoice');

      await this.subscriptionInvoiceRepository.create(subscriptionInvoice);
    //}

    // TODO: Faça alguma coisa com a notificação recebida sobre o pagamento
    console.log('--------receive-external-subscription-invoice-notification-FIM');
  }
}

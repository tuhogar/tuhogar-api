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
    const invoiceNotificated = await this.paymentGateway.getInvoice(subscriptionNotification);
    if (!invoiceNotificated) {
      console.log('NAO ENCONTROU A INVOICE NO SERVICO EXTERNO');
      throw new Error('notfound.invoice.notificated.do.not.exists');
    }

    
    const subscription = await this.subscriptionRepository.findByExternalId(invoiceNotificated.externalSubscriptionReference);
    if (!subscription) {
      console.log('NAO ENCONTROU A ASSINATURA DA FATURA NA BASE DE DADOS');
      throw new Error('notfound.subscription.do.not.exists');
    }

    invoiceNotificated.subscriptionId = subscription.id;
    invoiceNotificated.accountId = subscription.accountId;

    console.log('-----invoiceNotificated');
    console.log(invoiceNotificated);
    console.log('-----invoiceNotificated');

    if (subscriptionNotification.action === SubscriptionNotificationAction.CREATE) {
      console.log('CRIA FATURA');
      await this.subscriptionInvoiceRepository.create(invoiceNotificated);
    } else {
      const invoice = await this.subscriptionInvoiceRepository.findByExternalId(invoiceNotificated.externalId);
      if (!invoice) {
        console.log('NAO ENCONTROU A INVOICE NA BASE DE DADOS');
        throw new Error('notfound.invocie.do.not.exists');
      }

      console.log('ATUALIZA FATURA');
      await this.subscriptionInvoiceRepository.update(invoice.id, invoiceNotificated);
    }
  }
}

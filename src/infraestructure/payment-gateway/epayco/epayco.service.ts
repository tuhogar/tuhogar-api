import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IPaymentGateway } from 'src/application/interfaces/payment-gateway/payment-gateway.interface';
import { SubscriptionPayment, SubscriptionPaymentStatus } from 'src/domain/entities/subscription-payment';
import { Plan } from 'src/domain/entities/plan';
import { Subscription, SubscriptionStatus } from 'src/domain/entities/subscription';
import { SubscriptionNotification, SubscriptionNotificationAction, SubscriptionNotificationType } from 'src/domain/entities/subscription-notification';
import { SubscriptionInvoice, SubscriptionInvoiceStatus } from 'src/domain/entities/subscription-invoice';
import * as epayco from 'epayco-sdk-node';

@Injectable()
export class EPaycoService implements IPaymentGateway {
  private readonly epaycoClient: any;

  constructor(private readonly configService: ConfigService) {
    this.epaycoClient = new epayco({
      apiKey: this.configService.get<string>('EPAYCO_PUBLIC_KEY'),
      privateKey: this.configService.get<string>('EPAYCO_PRIVATE_KEY'),
      test: true, // Alterar para false em produção
    });
  }

  async createSubscription(accountId: string, subscriptionId: string, email: string, plan: Plan, paymentData: any): Promise<Subscription> {
    try {
      // Criar cliente no ePayco
      const customer = await this.epaycoClient.customers.create({
        token_card: paymentData.token,
        name: paymentData.name,
        email: email,
        phone: paymentData.phone,
        default: true,
      });

      // Criar assinatura
      const subscriptionData = {
        id_plan: plan.externalId,
        customer: customer.data.customerId,
        token_card: paymentData.token,
        doc_type: paymentData.docType,
        doc_number: paymentData.docNumber,
        url_confirmation: 'https://tuhogar.co/api/subscriptions/notifications', // URL do webhook
        method_confirmation: 'POST',
      };

      const subscriptionResult = await this.epaycoClient.subscriptions.create(subscriptionData);

      if (!subscriptionResult.status) {
        throw new Error(subscriptionResult.message || 'Error creating subscription');
      }

      const subscription = new Subscription({
        accountId,
        planId: plan.id,
        externalId: subscriptionResult.data.subscription.id,
        status: SubscriptionStatus.CREATED,
        externalPayerReference: customer.data.customerId,
      });

      return subscription;
    } catch (error) {
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<any> {
    try {
      const result = await this.epaycoClient.subscriptions.cancel(subscriptionId);

      if (!result.status) {
        throw new Error(result.message || 'Error cancelling subscription');
      }

      return result.data;
    } catch (error) {
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
  }

  async getSubscription(subscriptionNotification: SubscriptionNotification): Promise<Subscription> {
    const subscriptionNotificated = subscriptionNotification.subscription;

    let status = SubscriptionStatus.UNKNOWN;
    switch(subscriptionNotificated.status) {
      case 'active':
        status = SubscriptionStatus.ACTIVE;
        break;
      case 'inactive':
      case 'canceled':
        status = SubscriptionStatus.CANCELLED;
        break;
      case 'pending':
        status = SubscriptionStatus.PENDING;
        break;
      default:
        status = SubscriptionStatus.UNKNOWN;
        break;
    }

    const subscription = new Subscription({
      id: subscriptionNotificated.external_ref,
      externalId: subscriptionNotificated.subscription_id,
      accountId: subscriptionNotificated.client_id,
      planId: null,
      status,
      externalPayerReference: subscriptionNotificated.customer_id,
    });

    return subscription;
  }

  async getPayment(subscriptionNotification: SubscriptionNotification): Promise<SubscriptionPayment> {
    const paymentNotificated = subscriptionNotification.payment;

    let status = SubscriptionPaymentStatus.UNKNOWN;
    switch(paymentNotificated.status) {
      case 'Aceptada':
        status = SubscriptionPaymentStatus.APPROVED;
        break;
      case 'Pendiente':
        status = SubscriptionPaymentStatus.PENDING;
        break;
      case 'Rechazada':
        status = SubscriptionPaymentStatus.REJECTED;
        break;
      case 'Fallida':
        status = SubscriptionPaymentStatus.REJECTED;
        break;
      case 'Cancelada':
        status = SubscriptionPaymentStatus.CANCELLED;
        break;
      default:
        status = SubscriptionPaymentStatus.UNKNOWN;
        break;
    }

    return new SubscriptionPayment({
      subscriptionId: null,
      accountId: null,
      externalId: paymentNotificated.ref_payco,
      externalSubscriptionReference: paymentNotificated.subscription_id,
      externalPayerReference: paymentNotificated.customer_id,
      type: paymentNotificated.payment_method_type,
      method: paymentNotificated.payment_method,
      description: paymentNotificated.description,
      amount: paymentNotificated.amount,
      currency: paymentNotificated.currency,
      status,
    });
  }

  async getInvoice(subscriptionNotification: SubscriptionNotification): Promise<SubscriptionInvoice> {
    const invoiceNotificated = subscriptionNotification.invoice;

    let status = SubscriptionInvoiceStatus.UNKNOWN;
    switch(invoiceNotificated.status) {
      case 'pending':
        status = SubscriptionInvoiceStatus.SCHEDULED;
        break;
      case 'success':
        status = SubscriptionInvoiceStatus.PROCESSED;
        break;
      case 'failed':
        status = SubscriptionInvoiceStatus.CANCELLED;
        break;
      default:
        status = SubscriptionInvoiceStatus.UNKNOWN;
        break;
    }

    return new SubscriptionInvoice({
      subscriptionId: null,
      accountId: null,
      externalId: invoiceNotificated.invoice_id,
      externalSubscriptionReference: invoiceNotificated.subscription_id,
      description: invoiceNotificated.description,
      amount: invoiceNotificated.amount,
      currency: invoiceNotificated.currency,
      status,
    });
  }

  async getExternalSubscription(id: string): Promise<any> {
    try {
      const result = await this.epaycoClient.subscriptions.get(id);

      if (!result.status) {
        throw new Error(result.message || 'Error getting subscription');
      }

      return result.data;
    } catch (error) {
      throw new Error(`Failed to get subscription: ${error.message}`);
    }
  }

  async getExternalPayment(id: string): Promise<any> {
    try {
      const result = await this.epaycoClient.transactions.get(id);

      if (!result.status) {
        throw new Error(result.message || 'Error getting payment');
      }

      return result.data;
    } catch (error) {
      throw new Error(`Failed to get payment: ${error.message}`);
    }
  }

  async getExternalInvoice(id: string): Promise<any> {
    try {
      const result = await this.epaycoClient.subscriptions.getCharge(id);

      if (!result.status) {
        throw new Error(result.message || 'Error getting invoice');
      }

      return result.data;
    } catch (error) {
      throw new Error(`Failed to get invoice: ${error.message}`);
    }
  }

  async getSubscriptionNotification(payload: any): Promise<SubscriptionNotification> {
    const { x_ref_payco, x_transaction_id, x_subscription_id, x_invoice_id } = payload;
    
    let subscription: any = null;
    let payment: any = null;
    let invoice: any = null;

    let type = SubscriptionNotificationType.UNKNOWN;
    let action = SubscriptionNotificationAction.UNKNOWN;

    // Determine notification type and fetch corresponding data
    if (x_subscription_id) {
      type = SubscriptionNotificationType.SUBSCRIPTION;
      subscription = await this.getExternalSubscription(x_subscription_id);
      action = payload.x_type_operation === 'create' ? SubscriptionNotificationAction.CREATE : SubscriptionNotificationAction.UPDATE;
    } else if (x_invoice_id) {
      type = SubscriptionNotificationType.INVOICE;
      invoice = await this.getExternalInvoice(x_invoice_id);
      action = SubscriptionNotificationAction.CREATE;
    } else if (x_ref_payco || x_transaction_id) {
      type = SubscriptionNotificationType.PAYMENT;
      payment = await this.getExternalPayment(x_ref_payco || x_transaction_id);
      action = SubscriptionNotificationAction.CREATE;
    }

    const subscriptionNotification = new SubscriptionNotification({
      type,
      action,
      payload,
      subscription,
      payment,
      invoice,
    });

    return subscriptionNotification;
  }

  async updateSubscriptionPlan(subscriptionId: string, newPlanId: string): Promise<Subscription> {
    try {
      const result = await this.epaycoClient.subscriptions.update({
        id: subscriptionId,
        plan: newPlanId,
      });

      if (!result.status) {
        throw new Error(result.message || 'Error updating subscription plan');
      }

      const updatedSubscription = await this.getExternalSubscription(subscriptionId);
      return this.mapExternalSubscriptionToSubscription(updatedSubscription);
    } catch (error) {
      throw new Error(`Failed to update subscription plan: ${error.message}`);
    }
  }

  private mapExternalSubscriptionToSubscription(externalSubscription: any): Subscription {
    let status = SubscriptionStatus.UNKNOWN;
    switch(externalSubscription.status) {
      case 'active':
        status = SubscriptionStatus.ACTIVE;
        break;
      case 'inactive':
      case 'canceled':
        status = SubscriptionStatus.CANCELLED;
        break;
      case 'pending':
        status = SubscriptionStatus.PENDING;
        break;
      default:
        status = SubscriptionStatus.UNKNOWN;
        break;
    }

    return new Subscription({
      id: externalSubscription.external_ref,
      externalId: externalSubscription.subscription_id,
      accountId: externalSubscription.client_id,
      planId: externalSubscription.plan_id,
      status,
      externalPayerReference: externalSubscription.customer_id,
    });
  }
}

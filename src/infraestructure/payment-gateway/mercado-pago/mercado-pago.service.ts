import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IPaymentGateway } from 'src/application/interfaces/payment-gateway/payment-gateway.interface';
import { SubscriptionPayment, SubscriptionPaymentStatus } from 'src/domain/entities/subscription-payment';
import { Plan } from 'src/domain/entities/plan';
import { Subscription, SubscriptionStatus } from 'src/domain/entities/subscription';
import { SubscriptionNotification, SubscriptionNotificationAction, SubscriptionNotificationType } from 'src/domain/entities/subscription-notification';
import { SubscriptionInvoice, SubscriptionInvoiceStatus } from 'src/domain/entities/subscription-invoice';

@Injectable()
export class MercadoPagoService implements IPaymentGateway {
  private readonly apiUrl: string;
  private readonly accessToken: string;
  
  constructor(private readonly configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('MERCADOPAGO_API_URL');
    this.accessToken = this.configService.get<string>('MERCADOPAGO_ACCESS_TOKEN');
  }
  
  async createSubscription(accountId: string, subscriptionId: string, email: string, plan: Plan, paymentData: any): Promise<Subscription> {
    const subscriptionToCreate: any = {
      preapproval_plan_id: plan.externalId,
      reason: plan.name,
      external_reference: subscriptionId,
      payer_email: 'test_user_809658749@testuser.com',
      card_token_id: paymentData.token,
      auto_recurring: {
        frequency: 5,
        frequency_type: 'days',
        start_date: new Date(),
        end_date: null,
        transaction_amount: 5, // plan.price,
        currency_id: 'BRL'
      },
      status: 'authorized'
    }

    const url = `${this.apiUrl}/preapproval`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify(subscriptionToCreate),
    });

    const responseObject = await response.json();

    if (!response.ok) {
      const errorBody = responseObject;
      
      const message = `invalid.${errorBody.message || 'Unknown error occurred'}`;

      throw new Error(message);
    }

    const subscription = new Subscription({
      accountId,
      planId: plan.id, 
      externalId: responseObject.id,
      status: SubscriptionStatus.CREATED,
      externalPayerReference: responseObject.payer_id,
    });

    return subscription;
  }

  async cancelSubscription(subscriptionId: string): Promise<any> {
    throw Error('not implementation');
    /*
    const url = `${this.apiUrl}/v1/subscriptions/${subscriptionId}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });
  
    return await response.json();
    */
  }

  async getSubscription(subscriptionNotification: SubscriptionNotification): Promise<Subscription> {
    const subscriptionNotificated = subscriptionNotification.subscription;

    let status = SubscriptionStatus.UNKNOWN;
    switch(subscriptionNotificated.status) {
      case 'pending':
        status = SubscriptionStatus.ACTIVE;
        break;
      case 'authorized':
        status = SubscriptionStatus.ACTIVE;
        break;
      case 'paused':
        status = SubscriptionStatus.CANCELLED;
        break;
      case 'cancelled':
        status = SubscriptionStatus.CANCELLED;
        break;
    }

    const subscription = new Subscription({
      id: subscriptionNotificated.external_reference,
      externalId: subscriptionNotificated.id.toString(),
      accountId: null,
      planId: null,
      status,
      externalPayerReference: subscriptionNotificated.payer_id,
    });

    return subscription;
  }

  async getPayment(subscriptionNotification: SubscriptionNotification): Promise<SubscriptionPayment> {
    const paymentNotificated = subscriptionNotification.payment;

    let status = SubscriptionPaymentStatus.UNKNOWN;
    switch(paymentNotificated.status) {
      case 'pending':
        status = SubscriptionPaymentStatus.PENDING;
        break;
      case 'approved':
        status = SubscriptionPaymentStatus.APPROVED;
        break;
      case 'authorized':
        status = SubscriptionPaymentStatus.PENDING;
        break;
      case 'in_process':
        status = SubscriptionPaymentStatus.PENDING;
        break;
      case 'in_mediation':
        status = SubscriptionPaymentStatus.PENDING;
        break;
      case 'rejected':
        status = SubscriptionPaymentStatus.REJECTED;
        break;
      case 'cancelled':
        status = SubscriptionPaymentStatus.CANCELLED;
        break;
      case 'refunded':
        status = SubscriptionPaymentStatus.CANCELLED;
        break;
      case 'charged_back':
        status = SubscriptionPaymentStatus.CANCELLED;
        break;
      default:
        status = SubscriptionPaymentStatus.UNKNOWN;
        break;
    }

    return new SubscriptionPayment({
      subscriptionId: null,
      accountId: null,
      externalId: paymentNotificated.id.toString(),
      externalSubscriptionReference: null,
      externalPayerReference: paymentNotificated.payer.id,
      type: paymentNotificated.payment_type_id,
      method: paymentNotificated.payment_method_id,
      description: paymentNotificated.description,
      amount: paymentNotificated.transaction_amount,
      currency: paymentNotificated.currency_id,
      status,
    });
  }

  async getInvoice(subscriptionNotification: SubscriptionNotification): Promise<SubscriptionInvoice> {
    const invoiceNotificated = subscriptionNotification.invoice;

    let status = SubscriptionInvoiceStatus.UNKNOWN;
    switch(invoiceNotificated.status) {
      case 'scheduled':
        status = SubscriptionInvoiceStatus.SCHEDULED;
        break;
      case 'processed':
        status = SubscriptionInvoiceStatus.PROCESSED;
        break;
      case 'recycling':
        status = SubscriptionInvoiceStatus.PROCESSED;
        break;
      case 'cancelled':
        status = SubscriptionInvoiceStatus.CANCELLED;
        break;
      default:
        status = SubscriptionInvoiceStatus.UNKNOWN;
        break;
    }

    return new SubscriptionInvoice({
      subscriptionId: null,
      accountId: null,
      externalId: invoiceNotificated.id.toString(),
      externalSubscriptionReference: invoiceNotificated.preapproval_id,
      description: invoiceNotificated.type,
      amount: invoiceNotificated.transaction_amount,
      currency: invoiceNotificated.currency_id,
      status,
    });
  }

  async getExternalSubscription(id: string): Promise<any> {
    const url = `${this.apiUrl}/preapproval/${id}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });

    const responseObject = await response.json();

    if (!response.ok) {
      const errorBody = responseObject;
      
      const message = `invalid.${errorBody.message || 'Unknown error occurred'}`;

      throw new Error(message);
    }

    return responseObject;
  }

  async getExternalPayment(id: string): Promise<any> {
    const url = `${this.apiUrl}/v1/payments/${id}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });

    const responseObject = await response.json();

    if (!response.ok) {
      const errorBody = responseObject;
      
      const message = `invalid.${errorBody.message || 'Unknown error occurred'}`;

      throw new Error(message);
    }

    return responseObject;
  }

  async getExternalInvoice(id: string): Promise<any> {
    const url = `${this.apiUrl}/authorized_payments/${id}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`,
      },
    });

    const responseObject = await response.json();

    if (!response.ok) {
      const errorBody = responseObject;
      
      const message = `invalid.${errorBody.message || 'Unknown error occurred'}`;

      throw new Error(message);
    }

    return responseObject;
  }

  async getSubscriptionNotification(payload: any): Promise<SubscriptionNotification> {
    const externalId = payload?.data?.id;

    let subscription: any = null;
    let payment: any = null;
    let invoice: any = null;

    let type = SubscriptionNotificationType.UNKNOWN;
    switch(payload?.type) {
      case 'subscription_preapproval':
        type = SubscriptionNotificationType.SUBSCRIPTION;
        subscription = await this.getExternalSubscription(externalId);
        break;
      case 'subscription_authorized_payment':
        type = SubscriptionNotificationType.INVOICE;
        invoice = await this.getExternalInvoice(externalId);
        break;
      case 'payment':
        type = SubscriptionNotificationType.PAYMENT;
        payment = await this.getExternalPayment(externalId);
        break;
    }

    let action = SubscriptionNotificationAction.UNKNOWN;
    switch(payload?.action) {
      case 'payment.created':
        action = SubscriptionNotificationAction.CREATE;
        break;
      case 'created':
        action = SubscriptionNotificationAction.CREATE;
        break;
      case 'updated':
        action = SubscriptionNotificationAction.UPDATE;
        break;
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
}

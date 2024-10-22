import { v4 as uuidv4 } from 'uuid';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IPaymentGateway } from 'src/application/interfaces/payment-gateway/payment-gateway.interface';
import { SubscriptionPayment, SubscriptionPaymentStatus } from 'src/domain/entities/subscription-payment';
import { Plan } from 'src/domain/entities/plan';
import { Subscription, SubscriptionStatus } from 'src/domain/entities/subscription';
import { SubscriptionNotification, SubscriptionNotificationAction, SubscriptionNotificationType } from 'src/domain/entities/subscription-notification';
import { ExternalSubscription, ExternalSubscriptionStatus } from 'src/domain/entities/external-subscription';
import { ExternalSubscriptionPayment, ExternalSubscriptionPaymentStatus } from 'src/domain/entities/external-subscription-payment';
import { ExternalSubscriptionInvoice, ExternalSubscriptionInvoiceStatus } from 'src/domain/entities/external-subscription-invoice';

@Injectable()
export class MercadoPagoService implements IPaymentGateway {
  private readonly apiUrl: string;
  private readonly accessToken: string;
  
  constructor(private readonly configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('MERCADOPAGO_API_URL');
    this.accessToken = this.configService.get<string>('MERCADOPAGO_ACCESS_TOKEN');
  }
  
  async createSubscription(accountId: string, email: string, plan: Plan, paymentData: any): Promise<Subscription> {
    const subscriptionToCreate: any = {
      preapproval_plan_id: plan.externalId,
      reason: plan.name,
      external_reference: accountId,
      payer_email: 'test_user_809658749@testuser.com',
      card_token_id: paymentData.token,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'days',
        start_date: new Date(),
        end_date: null,
        transaction_amount: 1, // plan.price,
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
      status: SubscriptionStatus.PENDING,
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

  async getExternalSubscription(id: string): Promise<ExternalSubscription> {
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

    let status = ExternalSubscriptionStatus.UNKNOWN;
    switch(responseObject?.status) {
      case 'pending':
        status = ExternalSubscriptionStatus.PENDING;
        break;
      case 'authorized':
        status = ExternalSubscriptionStatus.ACTIVE;
        break;
      case 'paused':
        status = ExternalSubscriptionStatus.PAUSED;
        break;
      case 'cancelled':
        status = ExternalSubscriptionStatus.CANCELLED;
        break;
      default:
        status = ExternalSubscriptionStatus.UNKNOWN;
        break;
    }

    const externalSubscription = new ExternalSubscription({
      id: responseObject.id,
      status,
      payload: responseObject,
    });

    return externalSubscription;
  }

  async getExternalPayment(id: string): Promise<ExternalSubscriptionPayment> {
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

    let status = ExternalSubscriptionPaymentStatus.UNKNOWN;
    switch(responseObject?.status) {
      case 'pending':
        status = ExternalSubscriptionPaymentStatus.PENDING;
        break;
      case 'approved':
        status = ExternalSubscriptionPaymentStatus.APPROVED;
        break;
      case 'authorized':
        status = ExternalSubscriptionPaymentStatus.AUTHORIZED;
        break;
      case 'in_process':
        status = ExternalSubscriptionPaymentStatus.IN_PROCESS;
        break;
      case 'in_mediation':
        status = ExternalSubscriptionPaymentStatus.IN_MEDIATION;
        break;
      case 'rejected':
        status = ExternalSubscriptionPaymentStatus.REJECTED;
        break;
      case 'cancelled':
        status = ExternalSubscriptionPaymentStatus.CANCELLED;
        break;
      case 'refunded':
        status = ExternalSubscriptionPaymentStatus.REFUNDED;
        break;
      case 'charged_back':
        status = ExternalSubscriptionPaymentStatus.CHARGED_BACK;
        break;
      default:
        status = ExternalSubscriptionPaymentStatus.UNKNOWN;
        break;
    }

    const externalSubscriptionPayment = new ExternalSubscriptionPayment({
      id: responseObject.id,
      status,
      payload: responseObject,
    });

    return externalSubscriptionPayment;
  }

  async getExternalInvoice(id: string): Promise<ExternalSubscriptionInvoice> {
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

    let status = ExternalSubscriptionInvoiceStatus.UNKNOWN;
    switch(responseObject?.status) {
      case 'scheduled':
        status = ExternalSubscriptionInvoiceStatus.SCHEDULED;
        break;
      case 'processed':
        status = ExternalSubscriptionInvoiceStatus.PROCESSED;
        break;
      case 'recycling':
        status = ExternalSubscriptionInvoiceStatus.RECYCLING;
        break;
      case 'cancelled':
        status = ExternalSubscriptionInvoiceStatus.CANCELLED;
        break;
      default:
        status = ExternalSubscriptionInvoiceStatus.UNKNOWN;
        break;
    }

    const externalSubscriptionInvoice = new ExternalSubscriptionInvoice({
      id: responseObject.id,
      status,
      payload: responseObject,
    });

    return externalSubscriptionInvoice;
  }

  getSubscriptionNotification(payload: any): SubscriptionNotification {
    const externalId = payload?.data?.id;

    let type = SubscriptionNotificationType.UNKNOWN;
    switch(payload?.type) {
      case 'subscription_preapproval':
        type = SubscriptionNotificationType.SUBSCRIPTION;
        break;
      case 'subscription_authorized_payment':
        type = SubscriptionNotificationType.INVOICE;
        break;
      case 'payment':
        type = SubscriptionNotificationType.PAYMENT;
        break;
      default:
        type = SubscriptionNotificationType.UNKNOWN;
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
      default:
        action = SubscriptionNotificationAction.UNKNOWN;
        break;
    }


    const subscriptionNotification = new SubscriptionNotification({
        type,
        externalId,
        action,
        payload,
    });

    return subscriptionNotification;
  }
}

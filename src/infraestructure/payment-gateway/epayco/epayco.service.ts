import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IPaymentGateway } from 'src/application/interfaces/payment-gateway/payment-gateway.interface';
import { SubscriptionPayment, SubscriptionPaymentStatus } from 'src/domain/entities/subscription-payment';
import { Plan } from 'src/domain/entities/plan';
import { Subscription, SubscriptionStatus } from 'src/domain/entities/subscription';
import { SubscriptionNotification, SubscriptionNotificationAction, SubscriptionNotificationType } from 'src/domain/entities/subscription-notification';
import { SubscriptionInvoice, SubscriptionInvoiceStatus } from 'src/domain/entities/subscription-invoice';
import * as epayco from 'epayco-sdk-node';
import * as crypto from 'crypto';

@Injectable()
export class EPaycoService implements IPaymentGateway {
  private readonly epaycoClient: any;
  private readonly pCustIdCliente: string;
  private readonly pKey: string;

  constructor(private readonly configService: ConfigService) {
    this.epaycoClient = new epayco({
      apiKey: this.configService.get<string>('EPAYCO_PUBLIC_KEY'),
      privateKey: this.configService.get<string>('EPAYCO_PRIVATE_KEY'),
      test: this.configService.get<string>('EPAYCO_TEST') === 'true',
    });
    
    this.pCustIdCliente = this.configService.get<string>('EPAYCO_P_CUST_ID_CLIENTE');
    this.pKey = this.configService.get<string>('EPAYCO_P_KEY');
  }

  async createSubscription(accountId: string, subscriptionId: string, email: string, name: string, plan: Plan, paymentData: any): Promise<Subscription> {
    try {
      const result: Record<string, any> = {};
      console.log('------customer');
      console.log({
        token_card: paymentData.token,
        name: name,
        email: email,
        default: true,
      });
      console.log('------customer');

      const customer = await this.epaycoClient.customers.create({
        token_card: paymentData.token,
        name: name,
        email: email,
        default: true,
      });

      result.customer = customer;

      if (!customer.success) {
        throw new Error(customer.message || 'Error creating customer');
      }

      console.log('------customer-result');
      console.log(JSON.stringify(customer));
      console.log('------customer-result');

      // Criar assinatura
      const subscriptionData = {
        id_plan: plan.externalId,
        customer: customer.data.customerId,
        token_card: paymentData.token,
        doc_type: paymentData.docType,
        doc_number: paymentData.docNumber,
        ip: paymentData.ip,
      };

      console.log('-----subscriptionData');
      console.log(subscriptionData);
      console.log('-----subscriptionData');

      const subscriptionResult = await this.epaycoClient.subscriptions.create(subscriptionData);
      console.log('-----subscription-result');
      console.log(JSON.stringify(subscriptionResult));
      console.log('-----subscription-result');

      result.subscription = subscriptionResult;

      if (!subscriptionResult.success) {
        throw new Error(subscriptionResult.message || 'Error creating subscription');
      }

      const charge = await this.epaycoClient.subscriptions.charge(subscriptionData);
      console.log('-----charge-result');
      console.log(JSON.stringify(charge));
      console.log('-----charge-result');

      result.charge = charge;

      if (!charge.success || (charge.success && charge?.data?.estado !== 'Aceptada')) {
        throw new Error(charge?.data?.respuesta || 'Error charging subscription');
      }

      const subscription = new Subscription({
        accountId,
        planId: plan.id,
        externalId: subscriptionResult.id,
        status: SubscriptionStatus.ACTIVE,
        externalPayerReference: customer.data.customerId, // TODO: Verificar se o customerId é o externalPayerReference que precisamos
        resultIntegration: result,
      });

      return subscription;
    } catch (error) {
      console.log('-------error');
      console.log(error);
      console.log('-------error');
      throw error;
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<any> {
    const result = await this.epaycoClient.subscriptions.cancel(subscriptionId);

    if (!result.status) {
      throw new Error(result.message || 'Error cancelling subscription');
    }

    return result.data;
  }

  async getSubscription(subscriptionNotification: SubscriptionNotification): Promise<Subscription> {
    throw new Error(`Not implemented`);
  }

  async getPayment(subscriptionNotification: SubscriptionNotification): Promise<SubscriptionPayment> {
    const paymentNotificated = subscriptionNotification.payment;

    let status = SubscriptionPaymentStatus.UNKNOWN;
    switch(paymentNotificated.x_transaction_state) {
      case 'Aceptada':
        status = SubscriptionPaymentStatus.APPROVED;
        break;
      case 'Rechazada':
        status = SubscriptionPaymentStatus.REJECTED;
        break;
      case 'Pendiente':
        status = SubscriptionPaymentStatus.PENDING;
        break;
      case 'Abandonada':
        status = SubscriptionPaymentStatus.EXPIRED;
        break;
      case 'Cancelada':
        status = SubscriptionPaymentStatus.CANCELLED;
        break;
      case 'Expirada':
        status = SubscriptionPaymentStatus.EXPIRED;
        break;
      case 'Reversada':
        status = SubscriptionPaymentStatus.REVERSED;
        break;
      case 'Fallida':
        status = SubscriptionPaymentStatus.FAILED;
        break;
      default:
        status = SubscriptionPaymentStatus.UNKNOWN;
        break;
    }

    return new SubscriptionPayment({
      subscriptionId: null,
      accountId: null,
      externalId: paymentNotificated.x_transaction_id,
      externalSubscriptionReference: paymentNotificated.x_extra1,
      externalPayerReference: paymentNotificated.x_extra2,
      type: paymentNotificated.x_franchise,
      method: paymentNotificated.x_franchise,
      description: paymentNotificated.x_response,
      amount: paymentNotificated.x_amount,
      currency: paymentNotificated.x_currency_code,
      status,
    });
  }

  async getInvoice(subscriptionNotification: SubscriptionNotification): Promise<SubscriptionInvoice> {
    const invoiceNotificated = subscriptionNotification.invoice;

    let status = SubscriptionInvoiceStatus.UNKNOWN;
    switch(invoiceNotificated.x_transaction_state) {
      case 'Aceptada':
        status = SubscriptionInvoiceStatus.PROCESSED;
        break;
      case 'Rechazada':
        status = SubscriptionInvoiceStatus.CANCELLED;
        break;
      case 'Pendiente':
        status = SubscriptionInvoiceStatus.SCHEDULED;
        break;
      case 'Abandonada':
        status = SubscriptionInvoiceStatus.CANCELLED;
        break;
      case 'Cancelada':
        status = SubscriptionInvoiceStatus.CANCELLED;
        break;
      case 'Expirada':
        status = SubscriptionInvoiceStatus.CANCELLED;
        break;
      case 'Reversada':
        status = SubscriptionInvoiceStatus.CANCELLED;
        break;
      case 'Fallida':
        status = SubscriptionInvoiceStatus.CANCELLED;
        break;
      default:
        status = SubscriptionInvoiceStatus.UNKNOWN;
        break;
    }

    return new SubscriptionInvoice({
      subscriptionId: null,
      accountId: null,
      externalId: invoiceNotificated.x_id_factura,
      externalSubscriptionReference: invoiceNotificated.x_extra1,
      description: invoiceNotificated.x_response,
      amount: invoiceNotificated.x_amount,
      currency: invoiceNotificated.x_currency_code,
      status,
    });
  }

  async getExternalSubscription(id: string): Promise<any> {
    throw new Error(`Not implemented`);
  }

  async getExternalPayment(id: string): Promise<any> {
    throw new Error(`Not implemented`);
  }

  async getExternalInvoice(id: string): Promise<any> {
    throw new Error(`Not implemented`);
  }

  async getSubscriptionNotification(payload: any): Promise<SubscriptionNotification>{
    if (!this.validateSignature(payload)) {
      throw new Error('invalid.signature');
    }

    const { x_id_invoice } = payload;
    let subscription: any = null;
    let payment: any = null;
    let invoice: any = null;

    let type = SubscriptionNotificationType.UNKNOWN;
    let action = SubscriptionNotificationAction.UNKNOWN;

    if (x_id_invoice) {
      type = SubscriptionNotificationType.INVOICE_AND_PAYMENT;
      invoice = payload;
      payment = payload;
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

  private validateSignature(payload: any): boolean {
    const {
      x_ref_payco,
      x_transaction_id,
      x_amount,
      x_currency_code,
      x_signature
    } = payload;

    if (!x_signature) return false;

    const signatureString = `${this.pCustIdCliente}^${this.pKey}^${x_ref_payco}^${x_transaction_id}^${x_amount}^${x_currency_code}`;
    const calculatedSignature = crypto.createHash('sha256').update(signatureString).digest('hex');

    if (calculatedSignature !== x_signature) {
      console.log('Invalid signature:', {
        payload,
        calculatedSignature,
        receivedSignature: x_signature
      });
      return false;
    }

    return true;
  }

  async updateSubscriptionPlan(actualSubscription: Subscription, plan: Plan): Promise<Subscription> {
    try {
      console.log('------actualSubscription');
      console.log(actualSubscription);
      console.log('------actualSubscription');
      const subscriptionData = {
        id_plan: plan.externalId,
        customer: actualSubscription.externalPayerReference,
        token_card: actualSubscription.resultIntegration.charge.subscription.tokenCard,
        doc_type: actualSubscription.resultIntegration.subscription.customer.doc_type,
        doc_number: actualSubscription.resultIntegration.subscription.customer.doc_number,
      };

      console.log('------subscriptionData');
      console.log(subscriptionData);
      console.log('------subscriptionData');

      const result: Record<string, any> = {};
      const charge = await this.epaycoClient.subscriptions.charge(subscriptionData);

      result.charge = charge;

      if (!charge.success) {
        throw new Error(charge.message || 'Error charging subscription');
      }

      const subscription = new Subscription({
        accountId: actualSubscription.accountId,
        planId: plan.id,
        externalId: actualSubscription.externalId,
        status: SubscriptionStatus.ACTIVE,
        externalPayerReference: actualSubscription.externalPayerReference,
        resultIntegration: result,
      });

      return subscription;
    } catch (error) {
      console.log('-------error');
      console.log(error);
      console.log('-------error');
      throw new Error(`Failed to update subscription plan: ${error.message}`);
    }
  }
}

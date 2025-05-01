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
  private readonly baseUrl: string;
  private readonly subscriptionConfirmationPath: string;

  constructor(private readonly configService: ConfigService) {
    this.epaycoClient = new epayco({
      apiKey: this.configService.get<string>('EPAYCO_PUBLIC_KEY'),
      privateKey: this.configService.get<string>('EPAYCO_PRIVATE_KEY'),
      test: this.configService.get<string>('EPAYCO_TEST') === 'true',
    });
    
    this.pCustIdCliente = this.configService.get<string>('EPAYCO_P_CUST_ID_CLIENTE');
    this.pKey = this.configService.get<string>('EPAYCO_P_KEY');

    this.baseUrl = this.configService.get<string>('BASE_URL');
    this.subscriptionConfirmationPath = this.configService.get<string>('SUBSCRIPTION_CONFIRMATION_PATH');
  }

  async createSubscription(accountId: string, subscriptionId: string, email: string, name: string, plan: Plan, paymentData: any): Promise<Subscription> {
    try {
      const result: Record<string, any> = {};
      let subscriptionStatus = SubscriptionStatus.CREATED;

      // 1. Criar cliente na ePayco
      const customer = await this.epaycoClient.customers.create({
        token_card: paymentData.token,
        name: name,
        email: email,
        default: true,
      });

      console.log('------customer-result');
      console.log(JSON.stringify(customer));
      console.log('------customer-result');

      result.customer = customer;

      if (!customer.success) {
        console.error(`Error creating ePayco customer: ${customer.message || 'Unknown error'}`);
        throw new Error(`error.subscription.create.customer.creation.failed`);
      }

      // 2. Criar assinatura na ePayco
      const subscriptionData = {
        id_plan: plan.externalId,
        customer: customer.data.customerId,
        token_card: paymentData.token,
        doc_type: paymentData.docType,
        doc_number: paymentData.docNumber,
        ip: paymentData.ip,
        url_confirmation: `${this.baseUrl}/${this.subscriptionConfirmationPath}`,
        method_confirmation: 'POST',
      };

      const subscriptionResult = await this.epaycoClient.subscriptions.create(subscriptionData);
      console.log('-----subscription-result');
      console.log(JSON.stringify(subscriptionResult));
      console.log('-----subscription-result');

      result.subscription = subscriptionResult;

      if (!subscriptionResult.success) {
        console.error(`Error creating ePayco subscription: ${subscriptionResult.message || 'Unknown error'}`);
        throw new Error(`error.subscription.create.subscription.creation.failed`);
      }

      // 3. Iniciar cobrança da assinatura
      const charge = await this.epaycoClient.subscriptions.charge(subscriptionData);
      console.log('-----charge-result');
      console.log(JSON.stringify(charge));
      console.log('-----charge-result');

      result.charge = charge;

      // 4. Determinar o status da assinatura com base no resultado
      // Verificar se o plano tem período gratuito
      const hasFreeTrialPeriod = (result.charge?.subscription?.data?.trialDays && Number(result.charge?.subscription?.data?.trialDays) > 0) ||
            (result.charge?.data?.trialDays && Number(result.charge?.data?.trialDays) > 0);

      // Definir a data do próximo pagamento como D+30 (data atual + 30 dias)
      let nextPaymentDate = new Date();

      if (hasFreeTrialPeriod) {
        // Para planos com período gratuito, a assinatura é sempre ativa durante o período gratuito
        subscriptionStatus = SubscriptionStatus.ACTIVE;
        console.info(`Subscription with trial period created successfully. Trial ends on: ${charge.nextVerificationDate || 'Unknown'}`);
        
        // Atualizar a data do próximo pagamento com base na data de verificação do ePayco
        if (charge.nextVerificationDate) {
          // Converter a data do formato DD-MM-YYYY para um objeto Date
          const parts = charge.nextVerificationDate.split('-');
          if (parts.length === 3) {
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1; // Meses em JavaScript são 0-indexed
            const year = parseInt(parts[2], 10);
            
            nextPaymentDate = new Date(year, month, day);
            console.log(`Updated nextPaymentDate based on ePayco verification date: ${nextPaymentDate.toISOString()}`);
          }
        }
      } else {
        // Para planos sem período gratuito, o status depende do resultado da cobrança
        if (charge.success) {
          let paymentAccepted = false;
          let paymentPending = false;
          
          // Verificar o status da transação no objeto charge.data
          if (charge.data && charge.data.estado) {
            switch (charge.data.estado) {
              case 'Aceptada':
                paymentAccepted = true;
                break;
              case 'Pendiente':
                paymentPending = true;
                break;
              case 'Rechazada':
              case 'Fallida':
                await this.cancelSubscriptionOnInvalidCreate(subscriptionResult.id);
                console.error(`Payment rejected or failed: ${charge.data.respuesta || 'Unknown reason'}`);
                throw new Error(`error.subscription.create.payment.creation.failed`);
            }
          }
          
          // Verificar também o status da assinatura no objeto charge.subscription
          if (charge.subscription) {
            if (charge.subscription.status) {
             switch (charge.subscription.status.toLowerCase()) {
               case 'active':
                 paymentAccepted = true;
                 break;
               case 'pending':
                 paymentPending = true;
                 break;
             }
            }

            if (charge.subscription.nextVerificationDate) {
              console.info(`Next verification date: ${charge.subscription.nextVerificationDate}`);
              
              // Converter a data do formato DD-MM-YYYY para um objeto Date
              const parts = charge.subscription.nextVerificationDate.split('-');
              if (parts.length === 3) {
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1; // Meses em JavaScript são 0-indexed
                const year = parseInt(parts[2], 10);
                
                nextPaymentDate = new Date(year, month, day);
                console.log(`Updated nextPaymentDate based on subscription verification date: ${nextPaymentDate.toISOString()}`);
              }
            }
          }

        
          
          // Determinar o status final com base nas verificações
          if (paymentAccepted) {
            subscriptionStatus = SubscriptionStatus.ACTIVE;
          } else if (paymentPending) {
            subscriptionStatus = SubscriptionStatus.PENDING;
          } else {
            await this.cancelSubscriptionOnInvalidCreate(subscriptionResult.id);
            console.error(`Payment rejected or failed: ${charge?.data?.respuesta || 'Unknown reason'}`);
            throw new Error(`error.subscription.create.payment.creation.failed`);
          }
        } else {
          // Se a cobrança falhou completamente
          await this.cancelSubscriptionOnInvalidCreate(subscriptionResult.id);
          console.error(`Error charging subscription: ${charge?.message || 'Unknown error'}`);
          throw new Error(`error.subscription.create.payment.creation.failed`);
        }
      }

      // 5. Criar objeto Subscription para retornar ao sistema
      const subscription = new Subscription({
        accountId,
        planId: plan.id,
        externalId: subscriptionResult.id,
        status: subscriptionStatus,
        externalPayerReference: customer.data.customerId,
        resultIntegration: result,
        // Incluir a data do próximo pagamento
        nextPaymentDate,
      });

      // 6. Registrar informações importantes para rastreamento
      console.info(`Subscription created: ID=${subscriptionResult.id}, Status=${subscriptionStatus}, AccountID=${accountId}`);
      
      if (charge.data && charge.data.ref_payco) {
        console.info(`Payment reference: ${charge.data.ref_payco}, Invoice: ${charge.data.factura || 'N/A'}`);
      }
      
      return subscription;
    } catch (error) {
      console.error('-------error');
      console.error(error);
      console.error('-------error');
      throw error;
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<any> {
    const result = await this.epaycoClient.subscriptions.cancel(subscriptionId);

    if (!result.status) {
      throw new Error('error.subscription.cancel.failed');
    }

    return result.data;
  }

  async cancelSubscriptionOnInvalidCreate(subscriptionId: string): Promise<any> {
    const result = await this.epaycoClient.subscriptions.cancel(subscriptionId);

    if (!result.status) {
      throw new Error('error.subscription.create.cancel.on.invalid.create.failed');
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

    // Converter a string de data para um objeto Date
    let paymentDate: Date = null;
    
    if (paymentNotificated.x_transaction_date) {
      try {
        // Verificar o formato da data
        const dateParts = paymentNotificated.x_transaction_date.split(' ');
        
        if (dateParts.length === 2) {
          // Verificar se o formato é YYYY-MM-DD HH:MM:SS ou DD/MM/YYYY HH:MM:SS
          const dateFormat = dateParts[0].includes('-') ? 'ISO' : 'BR';
          
          if (dateFormat === 'ISO') {
            // Formato ISO: YYYY-MM-DD HH:MM:SS
            const [year, month, day] = dateParts[0].split('-');
            const [hour, minute, second] = dateParts[1].split(':');
            
            // Mês em JavaScript é 0-indexed (0-11)
            paymentDate = new Date(
              parseInt(year), 
              parseInt(month) - 1, 
              parseInt(day),
              parseInt(hour),
              parseInt(minute),
              parseInt(second)
            );
          } else {
            // Formato BR: DD/MM/YYYY HH:MM:SS
            const [day, month, year] = dateParts[0].split('/');
            const [hour, minute, second] = dateParts[1].split(':');
            
            // Mês em JavaScript é 0-indexed (0-11)
            paymentDate = new Date(
              parseInt(year), 
              parseInt(month) - 1, 
              parseInt(day),
              parseInt(hour),
              parseInt(minute),
              parseInt(second)
            );
          }
        } else if (dateParts.length === 1) {
          // Tentar converter diretamente, pode ser um formato ISO completo
          paymentDate = new Date(paymentNotificated.x_transaction_date);
        }
      } catch (error) {
        console.error(`Erro ao converter a data do pagamento: ${paymentNotificated.x_transaction_date}`, error);
      }
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
      paymentDate,
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

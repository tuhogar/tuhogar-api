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
import { Account } from 'src/domain/entities/account';

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
  
  /**
   * Converte uma data no formato DD-MM-YYYY da Colômbia para UTC,
   * usando a hora atual convertida para o fuso horário da Colômbia
   * @param dateString Data no formato DD-MM-YYYY
   * @returns Data em UTC
   */
  private convertColombianDateToUTC(dateString: string): Date {
    // Verificar se a string de data é válida
    if (!dateString || typeof dateString !== 'string') {
      console.error(`Invalid date string: ${dateString}`);
      return null;
    }
    
    // Converter a data do formato DD-MM-YYYY para um objeto Date
    const parts = dateString.split('-');
    if (parts.length !== 3) {
      console.error(`Invalid date format: ${dateString}`);
      return null;
    }
    
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Meses em JavaScript são 0-indexed
    const year = parseInt(parts[2], 10);
    
    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      console.error(`Invalid date components: day=${parts[0]}, month=${parts[1]}, year=${parts[2]}`);
      return null;
    }
    
    // Obter a hora atual em UTC
    const now = new Date();
    
    // Converter a hora atual para o fuso horário da Colômbia (UTC-5)
    // Primeiro, obtemos os componentes de hora em UTC
    const utcHours = now.getUTCHours();
    const utcMinutes = now.getUTCMinutes();
    const utcSeconds = now.getUTCSeconds();
    
    // Calcular a hora equivalente na Colômbia (UTC-5)
    let colombiaHours = utcHours - 5;
    // Ajustar se a hora ficar negativa (atravessar para o dia anterior)
    if (colombiaHours < 0) {
      colombiaHours += 24;
    }
    
    // Como a data fornecida pelo ePayco já está no fuso horário da Colômbia,
    // usamos diretamente os componentes da data sem ajustes
    
    // Criar uma data com a data fornecida pelo ePayco e a hora atual convertida para o fuso da Colômbia
    const colombianDateTime = new Date(Date.UTC(year, month, day, colombiaHours, utcMinutes, utcSeconds));
    const utcDateTime = new Date(Date.UTC(year, month, day, colombiaHours+5, utcMinutes, utcSeconds));
    
    // Converter de volta para UTC (a data já está em UTC, então não precisamos ajustar)
    console.log(`Original Colombian date: ${dateString}`);
    console.log(`Current time in Colombia: ${colombiaHours}:${utcMinutes}:${utcSeconds}`);
    console.log(`Combined date and time in UTC: ${colombianDateTime.toISOString()}`);
    console.log(`Combined date and time in UTC: ${utcDateTime.toISOString()}`);
    
    return utcDateTime;
  }

  async createSubscription(accountId: string, subscriptionId: string, email: string, name: string, plan: Plan, paymentData: any, customerId?: string): Promise<{ subscription: Subscription; customer: any }> {
    try {
      const result: Record<string, any> = {};
      let subscriptionStatus = SubscriptionStatus.CREATED;

      console.log('-------customer-data');
      console.log('Address:', paymentData?.address);
      console.log('Phone:', paymentData?.phone);
      console.log('-------customer-data');


      let customer: any;

      // 1. Criar cliente na ePayco
      if (!customerId) {
        customer = await this.epaycoClient.customers.create({
          token_card: paymentData.token,
          name: paymentData?.name || name,
          last_name: '',
          email: email,
          default: true,
          address: paymentData?.address,
          phone: paymentData?.phone,
          cell_phone: paymentData?.phone,
        });
        if (!customer.success) {
          console.error(`Error creating ePayco customer: ${customer.message || 'Unknown error'}`);
          throw new Error(`error.subscription.create.customer.creation.failed`);
        }

        console.log('------customer-result');
        console.log(JSON.stringify(customer));
        console.log('------customer-result');
      } else {
        customer = await this.getCustomer(paymentData.customerId);
      }

      result.customer = customer;

      await this.updateCustomer(
        customerId ||customer.data.customerId,
        paymentData?.name || name,
        email,
        paymentData?.address,
        paymentData?.phone,
        paymentData.docType,
        paymentData.docNumber
      );

      // 2. Criar assinatura na ePayco
      const subscriptionData = {
        id_plan: plan.externalId,
        customer: customerId || customer.data.customerId,
        token_card: paymentData.token,
        doc_type: paymentData.docType,
        doc_number: paymentData.docNumber,
        address: paymentData?.address,
        city: paymentData?.city,
        ip: paymentData.ip,
        url_confirmation: `${this.baseUrl}/${this.subscriptionConfirmationPath}`,
        method_confirmation: 'POST',
      };

      console.log('----subscriptionData');
      console.log(subscriptionData);
      console.log('----subscriptionData');

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
        
        // Atualizar a data do próximo pagamento
        if (charge.nextVerificationDate) {
          console.info(`Next verification date: ${charge.nextVerificationDate}`);
          
          // Converter a data do formato DD-MM-YYYY da Colômbia para UTC
          nextPaymentDate = this.convertColombianDateToUTC(charge.nextVerificationDate);
          if (nextPaymentDate) {
            console.log(`Updated nextPaymentDate based on charge verification date: ${nextPaymentDate.toISOString()}`);
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
                throw new Error(`error.subscription.create.payment.rejected`);
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
              
              // Converter a data do formato DD-MM-YYYY da Colômbia para UTC
              nextPaymentDate = this.convertColombianDateToUTC(charge.subscription.nextVerificationDate);
              if (nextPaymentDate) {
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
        externalPayerReference: customerId || customer.data.customerId,
        resultIntegration: result,
        // Incluir a data do próximo pagamento
        nextPaymentDate,
      });

      // 6. Registrar informações importantes para rastreamento
      console.info(`Subscription created: ID=${subscriptionResult.id}, Status=${subscriptionStatus}, AccountID=${accountId}`);
      
      if (charge.data && charge.data.ref_payco) {
        console.info(`Payment reference: ${charge.data.ref_payco}, Invoice: ${charge.data.factura || 'N/A'}`);
      }
      
      return { subscription, customer: { paymentToken: paymentData.token } };
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
          
          // Extrair componentes de data e hora
          let year: string, month: string, day: string;
          const [hour, minute, second] = dateParts[1].split(':');
          
          if (dateFormat === 'ISO') {
            // Formato ISO: YYYY-MM-DD HH:MM:SS
            [year, month, day] = dateParts[0].split('-');
          } else {
            // Formato BR: DD/MM/YYYY HH:MM:SS
            [day, month, year] = dateParts[0].split('/');
          }
          
          // Converter os componentes para números
          const yearNum = parseInt(year, 10);
          const monthNum = parseInt(month, 10) - 1; // Mês em JavaScript é 0-indexed (0-11)
          const dayNum = parseInt(day, 10);
          const hourNum = parseInt(hour, 10);
          const minuteNum = parseInt(minute, 10);
          const secondNum = parseInt(second, 10);
          
          // Criar a data no fuso horário da Colômbia usando UTC
          // A data vem no fuso horário da Colômbia (UTC-5)
          // Para converter para UTC, adicionamos 5 horas
          const colombianDate = new Date(Date.UTC(yearNum, monthNum, dayNum, hourNum, minuteNum, secondNum));
          colombianDate.setUTCHours(colombianDate.getUTCHours() + 5);
          
          console.log(`Original Colombian transaction date: ${paymentNotificated.x_transaction_date}`);
          console.log(`Converted to UTC: ${colombianDate.toISOString()}`);
          
          paymentDate = colombianDate;
        } else if (dateParts.length === 1) {
          // Tentar converter diretamente, assumindo que é um formato ISO completo
          const localDate = new Date(paymentNotificated.x_transaction_date);
          
          // Converter para UTC explicitamente
          // Primeiro criamos uma data UTC com os componentes da data local
          const utcDate = new Date(Date.UTC(
            localDate.getFullYear(),
            localDate.getMonth(),
            localDate.getDate(),
            localDate.getHours(),
            localDate.getMinutes(),
            localDate.getSeconds(),
            localDate.getMilliseconds()
          ));
          
          // Assumimos que a data está no fuso horário da Colômbia (UTC-5)
          // Para converter para UTC, adicionamos 5 horas
          utcDate.setUTCHours(utcDate.getUTCHours() + 5);
          
          console.log(`Original Colombian single-part date: ${paymentNotificated.x_transaction_date}`);
          console.log(`Converted to UTC: ${utcDate.toISOString()}`);
          
          paymentDate = utcDate;
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

  async getCustomer(customerId: string): Promise<any> {
    return this.epaycoClient.customers.get(customerId);
  }

  async deleteToken(customerId: string): Promise<void> {
    const customer = await this.getCustomer(customerId);
    console.log('customer: ', JSON.stringify(customer));
    if (!customer || (customer && !customer.data) || (customer && !customer.data.cards)) {
      throw new Error('customer.not.found');
    }

    if (customer && customer.data.cards && customer.data.cards.length > 0 && customer.data.cards.some((card: any) => card.default)) {
      const card = customer.data.cards.find((card: any) => card.default);

      const delete_customer_info = {
          franchise : card.franchise,
          mask : card.mask,
          customer_id: customer.data.id_customer
      }

      await this.epaycoClient.customers.delete(delete_customer_info);
    }
  }

  async changeCard(customerId: string, paymentData: any): Promise<void> {
    console.log('changeCard-start');
    console.log('customerId: ', customerId);
    console.log('paymentData: ', JSON.stringify(paymentData));
    await this.deleteToken(customerId);

    const add_customer_info = {
      token_card : paymentData.token,
      customer_id: customerId
    }

    console.log('add_customer_info: ', JSON.stringify(add_customer_info));

    await this.epaycoClient.customers.addNewToken(add_customer_info);
    console.log('changeCard-end');
  }

  async updateCustomer(customerId: string, name: string, email: string, address: string, phone: string, documentType: string, documentNumber: string): Promise<{ customerId: string }> {
    // 1. Atualizar cliente na ePayco
    const update_customer_info = {
      name: name,
      last_name: '',
      email: email,
      default: true,
      phone: phone,
      cell_phone: phone,
      doc_type: documentType,
      doc_number: documentNumber,
    }

    await this.epaycoClient.customers.update(customerId, update_customer_info);
    return { customerId };
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
}

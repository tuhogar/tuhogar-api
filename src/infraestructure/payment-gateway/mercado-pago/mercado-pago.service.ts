import { v4 as uuidv4 } from 'uuid';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IPaymentGateway } from 'src/application/interfaces/payment-gateway/payment-gateway.interface';
import { SubscriptionPayment, SubscriptionPaymentStatus } from 'src/domain/entities/subscription';

@Injectable()
export class MercadoPagoService implements IPaymentGateway {
  private readonly apiUrl: string;
  private readonly accessToken: string;
  private readonly validStatuses = ['approved', 'rejected', 'in_process'];

  constructor(private readonly configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('MERCADOPAGO_API_URL');
    this.accessToken = this.configService.get<string>('MERCADOPAGO_ACCESS_TOKEN');
  }

  async createSubscription(data: any): Promise<any> {
    const url = `${this.apiUrl}/preapproval`;
    console.log('-----url');
    console.log(url);
    console.log('-----url');
    console.log('-----data');
    console.log(data);
    console.log('-----data');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify(data),
    });

    return await response.json();
  }

  async updateSubscription(subscriptionId: string, newPlanData: any): Promise<any> {
    throw Error('not implementation');
    /*
    const url = `${this.apiUrl}/v1/subscriptions/${subscriptionId}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify(newPlanData),
    });
  
    return await response.json();
    */
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

  async createPayment(data: any): Promise<SubscriptionPayment> {
    const url = `${this.apiUrl}/v1/payments`;
    console.log('--------createPayment');
    console.log('-----url');
    console.log(url);
    console.log('-----url');
    console.log('-----data');
    console.log(data);
    console.log('-----data');
    console.log('--------createPayment');
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`,
        'X-Idempotency-Key': uuidv4(),
        
      },
      body: JSON.stringify(data),
    });
    
    const responseObject = await response.json();

    if (!response.ok) {
      const errorBody = responseObject;
      
      const message = `invalid.${errorBody.message || 'Unknown error occurred'}`;

      throw new Error(message);
    }

    // TODO:
    // Criar um domain payment e retornar no tipo dele.
    // id = id
    // paymentAt = date_created
    // approvedAt = date_approved
    // type = payment_type_id
    // method = payment_method_id
    // description = description
    // amount = transaction_amount
    // currency = currency_id
    // status = status
    // statusDescription = status_detail

    let status = SubscriptionPaymentStatus.REJECTED;
    switch (responseObject.status) {
      case 'approved':
        status = SubscriptionPaymentStatus.APPROVED;
        break;
      case 'rejected':
        status = SubscriptionPaymentStatus.REJECTED;
        break;
      case 'in_process':
        status = SubscriptionPaymentStatus.PENDING;
        break;
      default:
        break;
    }

    const subscriptionPayment = new SubscriptionPayment({
      id: responseObject.id,
      paymentAt: responseObject.date_created,
      approvedAt: responseObject.date_approved,
      type: responseObject.payment_type_id,
      method: responseObject.payment_method_id,
      description: responseObject.description,
      amount: responseObject.transaction_amount,
      currency: responseObject.currency_id,
      status,
      statusDescription: responseObject.status_detail,
    });

    return subscriptionPayment; 
  }
}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MercadoPagoService {
  private readonly apiUrl: string;
  private readonly accessToken: string;

  constructor(private readonly configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('mercadoPago.apiUrl');
    this.accessToken = this.configService.get<string>('mercadoPago.accessToken');
  }

  async createSubscription(data: any): Promise<any> {
    throw Error('not implementation');

/*    const url = `${this.apiUrl}/v1/subscriptions`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return await response.json();
    */
  }

  async updateSubscription(subscriptionId: string, newPlanData: any): Promise<any> {
    throw Error('not implementation');
    /*
    const url = `${this.apiUrl}/v1/subscriptions/${subscriptionId}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
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
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
    });
  
    return await response.json();
    */
  }
}

export interface IPaymentGateway {
    createSubscription(data: any): Promise<any>;
    cancelSubscription(subscriptionId: string): Promise<any>;
    updateSubscription(subscriptionId: string, newData: any): Promise<any>;
  }
  
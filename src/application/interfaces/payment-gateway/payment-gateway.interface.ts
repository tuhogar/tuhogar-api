import { SubscriptionPayment } from "src/domain/entities/subscription";

export abstract class IPaymentGateway {
    abstract createSubscription(data: any): Promise<any>;
    abstract cancelSubscription(subscriptionId: string): Promise<any>;
    abstract updateSubscription(subscriptionId: string, newData: any): Promise<any>;
    abstract createPayment(data: any): Promise<SubscriptionPayment>;
  }
  
import { Plan } from "src/domain/entities/plan";
import { Subscription } from "src/domain/entities/subscription";
import { SubscriptionNotification } from "src/domain/entities/subscription-notification";
import { SubscriptionPayment } from "src/domain/entities/subscription-payment";
import { SubscriptionInvoice } from "src/domain/entities/subscription-invoice";
export abstract class IPaymentGateway {
    abstract createSubscription(accountId: string, subscriptionId: string, email: string, plan: Plan, paymentData: Record<string, any>): Promise<Subscription>;
    abstract cancelSubscription(subscriptionId: string): Promise<any>;
    abstract getSubscription(subscriptionNotification: SubscriptionNotification): Promise<Subscription>;
    abstract getPayment(subscriptionNotification: SubscriptionNotification): Promise<SubscriptionPayment>;
    abstract getInvoice(subscriptionNotification: SubscriptionNotification): Promise<SubscriptionInvoice>;
    abstract getSubscriptionNotification(payload: any): Promise<SubscriptionNotification>;
  }
  
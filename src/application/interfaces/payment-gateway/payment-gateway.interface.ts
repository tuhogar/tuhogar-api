import { Plan } from "src/domain/entities/plan";
import { Subscription } from "src/domain/entities/subscription";
import { SubscriptionNotification } from "src/domain/entities/subscription-notification";
import { SubscriptionPayment } from "src/domain/entities/subscription-payment";
import { SubscriptionInvoice } from "src/domain/entities/subscription-invoice";
export abstract class IPaymentGateway {
    abstract createSubscription(accountId: string, subscriptionId: string, email: string, name: string, plan: Plan, paymentData: Record<string, any>): Promise<Subscription>;
    abstract cancelSubscription(subscriptionId: string): Promise<any>;
    abstract cancelSubscriptionOnInvalidCreate(subscriptionId: string): Promise<any>;
    abstract getSubscription(subscriptionNotification: SubscriptionNotification): Promise<Subscription>;
    abstract getPayment(subscriptionNotification: SubscriptionNotification): Promise<SubscriptionPayment>;
    abstract getInvoice(subscriptionNotification: SubscriptionNotification): Promise<SubscriptionInvoice>;
    abstract getSubscriptionNotification(payload: any): Promise<SubscriptionNotification>;
    abstract getCustomer(customerId: string): Promise<any>
    abstract deleteToken(customerId: string): Promise<void>
    abstract changeCard(customerId: string, paymentData: any): Promise<void>
    abstract updateSubscriptionPlan(actualSubscription: Subscription, plan: Plan): Promise<Subscription>;
  }
  
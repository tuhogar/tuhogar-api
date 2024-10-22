import { Plan } from "src/domain/entities/plan";
import { Subscription, SubscriptionStatus } from "src/domain/entities/subscription";
import { SubscriptionNotification } from "src/domain/entities/subscription-notification";
import { SubscriptionPayment } from "src/domain/entities/subscription-payment";
import { ExternalSubscription } from "src/domain/entities/external-subscription";
import { ExternalSubscriptionPayment } from "src/domain/entities/external-subscription-payment";
import { ExternalSubscriptionInvoice } from "src/domain/entities/external-subscription-invoice";
export abstract class IPaymentGateway {
    abstract createSubscription(accountId: string, email: string, plan: Plan, paymentData: Record<string, any>): Promise<Subscription>;
    abstract cancelSubscription(subscriptionId: string): Promise<any>;
    abstract getExternalSubscription(id: string): Promise<ExternalSubscription>;
    abstract getExternalPayment(payment: any): Promise<ExternalSubscriptionPayment>;
    abstract getExternalInvoice(invoice: any): Promise<ExternalSubscriptionInvoice>;
    abstract getSubscriptionNotification(payload: any): SubscriptionNotification;
  }
  
import { SubscriptionNotification } from 'src/domain/entities/subscription-notification';

export abstract class ISubscriptionNotificationRepository {
  abstract create(sobreubscriptionNotification: SubscriptionNotification): Promise<SubscriptionNotification>;
  abstract addSubscription(id: string, subscription: Record<string, any>): Promise<SubscriptionNotification>;
  abstract addPayment(id: string, payment: Record<string, any>): Promise<SubscriptionNotification>;
  abstract addInvoice(id: string, invoice: Record<string, any>): Promise<SubscriptionNotification>;
}

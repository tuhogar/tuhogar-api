import { SubscriptionNotification } from 'src/domain/entities/subscription-notification';

export abstract class ISubscriptionNotificationRepository {
  abstract create(sobreubscriptionNotification: SubscriptionNotification): Promise<SubscriptionNotification>;
}

import { SubscriptionNotification, SubscriptionNotificationAction, SubscriptionNotificationType } from 'src/domain/entities/subscription-notification';
import { SubscriptionNotification as SubscriptionNotificationDocument } from '../entities/subscription-notification.entity';

export class MongooseSubscriptionNotificationMapper {
    
    static toDomain(entity: SubscriptionNotificationDocument): SubscriptionNotification {
        if (!entity) return null;
        
        const model = new SubscriptionNotification({
            id: entity._id.toString(),
            type: entity.type as SubscriptionNotificationType,
            action: entity.action as SubscriptionNotificationAction,
            payload: entity.payload,
            subscription: entity.subscription,
            payment: entity.payment,
            invoice: entity.invoice,
        });
        return model;
    }

    static toMongoose(notification: SubscriptionNotification) {
        return {
            type: notification.type,
            action: notification.action,
            payload: notification.payload,
            subscription: notification.subscription,
            payment: notification.payment,
            invoice: notification.invoice,
        }
    }
}
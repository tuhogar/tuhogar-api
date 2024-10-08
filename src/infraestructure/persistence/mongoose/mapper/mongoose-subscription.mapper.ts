import { Subscription } from 'src/domain/entities/subscription';
import { Subscription as SubscriptionDocument } from '../entities/subscription.entity';

export class MongooseSubscriptionMapper {
    
    static toDomain(entity: SubscriptionDocument): Subscription {
        if (!entity) return null;
        
        const model = new Subscription({
            id: entity._id.toString(),
            accountId: !entity.accountId.createdAt ? entity.accountId?.toString() : entity.accountId._id.toString(),
            planId: entity.planId?.toString(),
            externalId: entity.externalId,
            status: entity.status
        });
        return model;
    }

    static toMongoose(subscription: Subscription) {
        return {
            accountId: subscription.accountId,
            planId: subscription.planId,
            externalId: subscription.externalId,
            status: subscription.status,
        }
    }
}
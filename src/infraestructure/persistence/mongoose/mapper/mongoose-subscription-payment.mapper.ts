import { SubscriptionPayment, SubscriptionPaymentStatus } from 'src/domain/entities/subscription-payment';
import { SubscriptionPayment as SubscriptionPaymentDocument } from '../entities/subscription-payment.entity';

export class MongooseSubscriptionPaymentMapper {
    
    static toDomain(entity: SubscriptionPaymentDocument): SubscriptionPayment {
        if (!entity) return null;
        
        const model = new SubscriptionPayment({
            id: entity._id.toString(),
            accountId: entity.accountId?.toString(),
            subscriptionId: entity.subscriptionId?.toString(),
            externalId: entity.externalId,
            externalSubscriptionReference: entity.externalSubscriptionReference,
            externalPayerReference: entity.externalPayerReference,
            type: entity.type,
            method: entity.method,
            description: entity.description,
            amount: entity.amount,
            currency: entity.currency,
            status: entity.status as SubscriptionPaymentStatus,
        });
        return model;
    }

    static toMongoose(subscriptionPayment: SubscriptionPayment) {
        return {
            accountId: subscriptionPayment.accountId,
            subscriptionId: subscriptionPayment.subscriptionId,
            externalId: subscriptionPayment.externalId,
            externalSubscriptionReference: subscriptionPayment.externalSubscriptionReference,
            externalPayerReference: subscriptionPayment.externalPayerReference,
            type: subscriptionPayment.type,
            method: subscriptionPayment.method,
            description: subscriptionPayment.description,
            amount: subscriptionPayment.amount,
            currency: subscriptionPayment.currency,
            status: subscriptionPayment.status,
        }
    }
}
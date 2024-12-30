import { SubscriptionInvoice, SubscriptionInvoiceStatus } from 'src/domain/entities/subscription-invoice';
import { SubscriptionInvoice as SubscriptionInvoiceDocument } from '../entities/subscription-invoice.entity';

export class MongooseSubscriptionInvoiceMapper {
    
    static toDomain(entity: SubscriptionInvoiceDocument): SubscriptionInvoice {
        if (!entity) return null;
        
        const model = new SubscriptionInvoice({
            id: entity._id.toString(),
            accountId: entity.accountId?.toString(),
            subscriptionId: entity.subscriptionId?.toString(),
            externalId: entity.externalId,
            externalSubscriptionReference: entity.externalSubscriptionReference,
            description: entity.description,
            amount: entity.amount,
            currency: entity.currency,
            status: entity.status as SubscriptionInvoiceStatus,
        });
        return model;
    }

    static toMongoose(subscriptionInvoice: SubscriptionInvoice) {
        return {
            accountId: subscriptionInvoice.accountId,
            subscriptionId: subscriptionInvoice.subscriptionId,
            externalId: subscriptionInvoice.externalId,
            externalSubscriptionReference: subscriptionInvoice.externalSubscriptionReference,
            description: subscriptionInvoice.description,
            amount: subscriptionInvoice.amount,
            currency: subscriptionInvoice.currency,
            status: subscriptionInvoice.status,
        }
    }
}
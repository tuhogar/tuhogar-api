import { Subscription, SubscriptionStatus } from 'src/domain/entities/subscription';
import { Subscription as SubscriptionDocument } from '../entities/subscription.entity';
import { MongoosePlanMapper } from './mongoose-plan.mapper';

export class MongooseSubscriptionMapper {
    
    static toDomain(entity: SubscriptionDocument): Subscription {
        if (!entity) return null;

        const model = new Subscription({
            id: entity._id.toString(),
            accountId: !entity.accountId?.createdAt ? entity.accountId?.toString() : entity.accountId._id.toString(),
            planId: !entity.planId?.createdAt ? entity.planId?.toString() : entity.planId._id.toString(),
            externalId: entity.externalId,
            status: entity.status as SubscriptionStatus,
            externalPayerReference: entity.externalPayerReference,
            resultIntegration: entity.resultIntegration,
            effectiveCancellationDate: entity.effectiveCancellationDate,
            paymentDate: entity.paymentDate,
            nextPaymentDate: entity.nextPaymentDate,
            createdAt: entity.createdAt,
            // Mapeia o plan quando disponível (após populate)
            plan: entity.planId?.createdAt ? MongoosePlanMapper.toDomain(entity.planId) : undefined,
        });
        return model;
    }

    static toMongoose(subscription: Subscription) {
        return {
            accountId: subscription.accountId,
            planId: subscription.planId,
            externalId: subscription.externalId,
            status: subscription.status,
            externalPayerReference: subscription.externalPayerReference,
            resultIntegration: subscription.resultIntegration,
            effectiveCancellationDate: subscription.effectiveCancellationDate,
            paymentDate: subscription.paymentDate,
            nextPaymentDate: subscription.nextPaymentDate,
        }
    }
}
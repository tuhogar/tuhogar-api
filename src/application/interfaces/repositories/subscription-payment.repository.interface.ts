import { SubscriptionPayment } from "src/domain/entities/subscription-payment";

export abstract class ISubscriptionPaymentRepository {
    abstract find(): Promise<SubscriptionPayment[]>
    abstract findOneByExternalId(externalId: string): Promise<SubscriptionPayment>
    abstract create(subscriptionPayment: SubscriptionPayment): Promise<SubscriptionPayment>
    abstract update(id: string, subscriptionPayment: SubscriptionPayment): Promise<SubscriptionPayment>
}
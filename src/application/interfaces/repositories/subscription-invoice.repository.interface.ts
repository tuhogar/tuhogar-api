import { SubscriptionInvoice } from "src/domain/entities/subscription-invoice";

export abstract class ISubscriptionInvoiceRepository {
    abstract find(): Promise<SubscriptionInvoice[]>
    abstract findOneByExternalId(externalId: string): Promise<SubscriptionInvoice>
    abstract create(subscriptionInvoice: SubscriptionInvoice): Promise<SubscriptionInvoice>
    abstract update(id: string, subscriptionInvoice: SubscriptionInvoice): Promise<SubscriptionInvoice>
}
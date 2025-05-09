import { SubscriptionPayment } from "src/domain/entities/subscription-payment";

export abstract class ISubscriptionPaymentRepository {
    abstract find(): Promise<SubscriptionPayment[]>
    abstract findOneByExternalId(externalId: string): Promise<SubscriptionPayment>
    abstract create(subscriptionPayment: SubscriptionPayment): Promise<SubscriptionPayment>
    abstract update(id: string, subscriptionPayment: SubscriptionPayment): Promise<SubscriptionPayment>
    
    /**
     * Busca todos os pagamentos relacionados a uma assinatura, ordenados por data de pagamento (mais recentes primeiro)
     * @param subscriptionId ID da assinatura
     * @returns Array de pagamentos da assinatura
     */
    abstract findAllBySubscriptionId(subscriptionId: string): Promise<SubscriptionPayment[]>
}
import { SubscriptionWithPayments } from 'src/domain/entities/subscription-with-payments';
import { GetSubscriptionHistoryOutputDto } from '../get-subscription-history.output.dto';

/**
 * Classe responsável por mapear a entidade de domínio SubscriptionWithPayments
 * para o DTO de saída GetSubscriptionHistoryOutputDto
 */
export class GetSubscriptionHistoryOutputDtoMapper {
  /**
   * Converte a entidade de domínio SubscriptionWithPayments para o DTO de saída
   * Garante que todas as propriedades sejam retornadas, mesmo que sejam null
   * 
   * @param subscription Entidade de domínio com os dados da assinatura e seus pagamentos
   * @returns DTO de saída formatado para a API
   */
  public static toOutputDto(subscription: SubscriptionWithPayments): GetSubscriptionHistoryOutputDto {
    return {
      id: subscription.id,
      planId: subscription.planId,
      status: subscription.status,
      effectiveCancellationDate: subscription.effectiveCancellationDate || null,
      paymentDate: subscription.paymentDate || null,
      nextPaymentDate: subscription.nextPaymentDate || null,
      createdAt: subscription.createdAt || null,
      // Mapeia o plan quando disponível
      plan: subscription.plan ? {
        id: subscription.plan.id,
        name: subscription.plan.name,
        price: subscription.plan.price,
        items: subscription.plan.items,
        freeTrialDays: subscription.plan.freeTrialDays || null,
        photo: subscription.plan.photo || null
      } : null,
      // Mapeia os pagamentos, garantindo que o array existe
      payments: subscription.payments ? subscription.payments.map(payment => ({
        id: payment.id,
        subscriptionId: payment.subscriptionId,
        accountId: payment.accountId,
        externalId: payment.externalId,
        type: payment.type,
        method: payment.method,
        description: payment.description,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paymentDate: payment.paymentDate || null
      })) : []
    };
  }

  /**
   * Converte uma lista de entidades de domínio SubscriptionWithPayments para uma lista de DTOs de saída
   * 
   * @param subscriptions Lista de entidades de domínio com os dados das assinaturas e seus pagamentos
   * @returns Lista de DTOs de saída formatados para a API
   */
  public static toOutputDtoList(subscriptions: SubscriptionWithPayments[]): GetSubscriptionHistoryOutputDto[] {
    if (!subscriptions) return [];
    return subscriptions.map(subscription => this.toOutputDto(subscription));
  }
}

import { SubscriptionPaymentWithSubscription } from 'src/domain/entities/subscription-payment-with-subscription';
import { GetSubscriptionPaymentHistoryOutputDto } from '../get-subscription-payment-history.output.dto';

/**
 * Classe responsável por mapear a entidade de domínio SubscriptionPaymentWithSubscription
 * para o DTO de saída GetSubscriptionPaymentHistoryOutputDto
 */
export class GetSubscriptionPaymentHistoryOutputDtoMapper {
  /**
   * Converte a entidade de domínio SubscriptionPaymentWithSubscription para o DTO de saída
   * Garante que todas as propriedades sejam retornadas, mesmo que sejam null
   * 
   * @param payment Entidade de domínio com os dados do pagamento e sua assinatura
   * @returns DTO de saída formatado para a API
   */
  public static toOutputDto(payment: SubscriptionPaymentWithSubscription): GetSubscriptionPaymentHistoryOutputDto {
    return {
      id: payment.id,
      method: payment.method,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      paymentDate: payment.paymentDate || null,
      // Mapeia a subscription quando disponível
      subscription: payment.subscription ? {
        id: payment.subscription.id,
        status: payment.subscription.status,
        nextPaymentDate: payment.subscription.nextPaymentDate || null,
        // Mapeia o plan quando disponível
        plan: payment.subscription.plan ? {
          id: payment.subscription.plan.id,
          name: payment.subscription.plan.name,
          price: payment.subscription.plan.price
        } : null
      } : null
    };
  }

  /**
   * Converte uma lista de entidades de domínio SubscriptionPaymentWithSubscription para uma lista de DTOs de saída
   * 
   * @param payments Lista de entidades de domínio com os dados dos pagamentos e suas assinaturas
   * @returns Lista de DTOs de saída formatados para a API
   */
  public static toOutputDtoList(payments: SubscriptionPaymentWithSubscription[]): GetSubscriptionPaymentHistoryOutputDto[] {
    if (!payments) return [];
    return payments.map(payment => this.toOutputDto(payment));
  }
}

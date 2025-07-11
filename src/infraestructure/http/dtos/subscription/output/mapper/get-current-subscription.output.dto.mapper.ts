import { SubscriptionWithRemainingFreeDays } from 'src/domain/entities/subscription-with-remaining-free-days';
import { GetCurrentSubscriptionOutputDto } from '../get-current-subscription.output.dto';

/**
 * Classe responsável por mapear a entidade de domínio SubscriptionWithRemainingFreeDays
 * para o DTO de saída GetCurrentSubscriptionOutputDto
 */
export class GetCurrentSubscriptionOutputDtoMapper {
  /**
   * Converte a entidade de domínio SubscriptionWithRemainingFreeDays para o DTO de saída
   * Garante que todas as propriedades sejam retornadas, mesmo que sejam null
   * 
   * @param subscription Entidade de domínio com os dados da assinatura e dias gratuitos restantes
   * @returns DTO de saída formatado para a API
   */
  public static toOutputDto(subscription: SubscriptionWithRemainingFreeDays): GetCurrentSubscriptionOutputDto {
    return {
      id: subscription.id,
      planId: subscription.planId,
      status: subscription.status,
      effectiveCancellationDate: subscription.effectiveCancellationDate || null,
      paymentDate: subscription.paymentDate || null,
      nextPaymentDate: subscription.nextPaymentDate || null,
      createdAt: subscription.createdAt || null,
      remainingFreeDays: subscription.remainingFreeDays,
      isCouponRedeemed: subscription.isCouponRedeemed,
      // Mapeia o plan quando disponível
      plan: subscription.plan ? {
        id: subscription.plan.id,
        name: subscription.plan.name,
        price: subscription.plan.price,
        items: subscription.plan.items,
        freeTrialDays: subscription.plan.freeTrialDays || null,
        maxAdvertisements: subscription.plan.maxAdvertisements,
        maxPhotos: subscription.plan.maxPhotos,
        photo: subscription.plan.photo || null
      } : null
    };
  }
}

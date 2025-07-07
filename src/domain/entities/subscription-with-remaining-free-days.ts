import { Subscription } from './subscription';

/**
 * Interface que estende Subscription e adiciona a propriedade remainingFreeDays
 * para representar quantos dias gratuitos ainda restam na assinatura
 */
export interface SubscriptionWithRemainingFreeDays extends Subscription {
  /**
   * Número de dias gratuitos restantes na assinatura
   * Se for zero, significa que o período gratuito já acabou
   */
  remainingFreeDays: number;

  /**
   * Indica se o cupom de documento foi aplicado
   */
  isCouponRedeemed: boolean;
}

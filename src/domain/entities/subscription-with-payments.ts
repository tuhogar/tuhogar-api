import { Subscription } from './subscription';
import { SubscriptionPayment } from './subscription-payment';

/**
 * Interface que estende Subscription e adiciona a propriedade payments
 * para representar os pagamentos associados à assinatura
 */
export interface SubscriptionWithPayments extends Subscription {
  /**
   * Array de pagamentos associados à assinatura
   * Ordenados por data de pagamento (mais recentes primeiro)
   */
  payments: SubscriptionPayment[];
}

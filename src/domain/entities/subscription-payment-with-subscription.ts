import { Subscription } from './subscription';
import { SubscriptionPayment } from './subscription-payment';

/**
 * Interface que estende SubscriptionPayment adicionando a propriedade subscription
 * Utilizada pelo caso de uso GetSubscriptionPaymentHistoryUseCase
 */
export interface SubscriptionPaymentWithSubscription extends SubscriptionPayment {
  subscription?: Subscription;
}

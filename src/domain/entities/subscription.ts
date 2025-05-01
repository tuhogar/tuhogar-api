export enum SubscriptionStatus {
  UNKNOWN = 'UNKNOWN',
  PENDING = 'PENDING',
  CREATED = 'CREATED',
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  CANCELLED_ON_PAYMENT_GATEWAY = 'CANCELLED_ON_PAYMENT_GATEWAY',
}
export class Subscription {
  id?: string;
  public accountId: string;
  public planId: string;
  public externalId?: string;
  public status: SubscriptionStatus;
  public externalPayerReference?: string;
  public resultIntegration?: Record<string, any>;
  /**
   * Data efetiva de cancelamento da assinatura
   * Utilizada quando o status é CANCELLED_ON_PAYMENT_GATEWAY para determinar
   * quando a assinatura deve ser efetivamente cancelada (status CANCELLED)
   */
  public effectiveCancellationDate?: Date;

  /**
   * Data do último pagamento realizado para esta assinatura
   * Atualizada quando um pagamento é aprovado
   */
  public paymentDate?: Date;

  /**
   * Data prevista para o próximo pagamento da assinatura
   * Calculada como paymentDate + 30 dias quando um pagamento é aprovado
   * Ou como data atual + 30 dias quando a assinatura é criada
   */
  public nextPaymentDate?: Date;
  
  /**
   * Data de criação da assinatura
   * Adicionada automaticamente pelo Mongoose
   */
  public createdAt?: Date;

  /**
   * Data da última atualização da assinatura
   * Adicionada automaticamente pelo Mongoose
   */
  public updatedAt?: Date;
  
  constructor(props: Subscription) {
    Object.assign(this, props);
  }
}
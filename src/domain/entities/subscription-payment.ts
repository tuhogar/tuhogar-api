export enum SubscriptionPaymentStatus {
  UNKNOWN = 'UNKNOWN',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
  REVERSED = 'REVERSED',
  FAILED = 'FAILED',
}
export class SubscriptionPayment {
  id?: string;
  public subscriptionId?: string;
  public accountId: string;
  public externalId: string;
  public externalSubscriptionReference?: string;
  public externalPayerReference?: string;
  public type: string;
  public method: string;
  public description: string;
  public amount: number;
  public currency: string;
  public status: SubscriptionPaymentStatus;
  
  constructor(props: SubscriptionPayment) {
    Object.assign(this, props);
  }
}

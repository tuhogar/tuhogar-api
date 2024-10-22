export enum SubscriptionPaymentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  AUTHORIZED = 'AUTHORIZED',
  IN_PROCESS = 'IN_PROCESS',
  IN_MEDIATION = 'IN_MEDIATION',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  CHARGED_BACK = 'CHARGED_BACK',
}
export class SubscriptionPayment {
  id?: string;
  public subscriptionId?: string;
  public accountId: string;
  public externalId: string;
  public externalSubscriptionReference?: string;
  public paymentAt: Date;
  public approvedAt: Date;
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

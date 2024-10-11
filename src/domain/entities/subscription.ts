export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  CANCELED = 'CANCELED',
}
export class Subscription {
  id?: string;
  public accountId: string;
  public planId: string;
  public externalId: string;
  public status: string;

  constructor(props: Subscription) {
    Object.assign(this, props);
  }
}

export enum SubscriptionPaymentStatus {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PENDING = 'PENDING',
}
export class SubscriptionPayment {
  id?: string;
  public paymentAt: Date;
  public approvedAt = Date;
  public type: string;
  public method: string;
  public description: string;
  public amount: number;
  public currency: string;
  public status: SubscriptionPaymentStatus;
  public statusDescription: string;

  constructor(props: SubscriptionPayment) {
    Object.assign(this, props);
  }
}

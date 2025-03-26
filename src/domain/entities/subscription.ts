export enum SubscriptionStatus {
  UNKNOWN = 'UNKNOWN',
  PENDING = 'PENDING',
  CREATED = 'CREATED',
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
}
export class Subscription {
  id?: string;
  public accountId: string;
  public planId: string;
  public externalId?: string;
  public status: SubscriptionStatus;
  public externalPayerReference?: string;
  
  constructor(props: Subscription) {
    Object.assign(this, props);
  }
}
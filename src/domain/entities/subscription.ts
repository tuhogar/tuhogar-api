export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  CANCELLED = 'CANCELLED',
  PAUSED = 'PAUSED',
}
export class Subscription {
  id?: string;
  public accountId: string;
  public planId: string;
  public externalId: string;
  public status: string;
  public externalPayerReference?: string;
  
  constructor(props: Subscription) {
    Object.assign(this, props);
  }
}
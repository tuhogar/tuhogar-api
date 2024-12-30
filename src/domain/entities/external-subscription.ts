export enum ExternalSubscriptionStatus {
  UNKNOWN = 'UNKNOWN',
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  CANCELLED = 'CANCELLED',
  PAUSED = 'PAUSED',
}

export class ExternalSubscription {
  id?: string;
  public status: ExternalSubscriptionStatus;
  public payload: Record<string, any>;

  constructor(props: ExternalSubscription) {
    Object.assign(this, props);
  }
}
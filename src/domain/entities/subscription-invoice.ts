export enum SubscriptionInvoiceStatus {
  UNKNOWN = 'UNKNOWN',
  SCHEDULED = 'SCHEDULED',
  PROCESSED = 'PROCESSED',
  CANCELLED = 'CANCELLED',
}
export class SubscriptionInvoice {
  id?: string;
  public subscriptionId: string;
  public accountId: string;
  public externalId: string;
  public externalSubscriptionReference?: string;
  public description: string;
  public amount: number;
  public currency: string;
  public status: SubscriptionInvoiceStatus;
  
  constructor(props: SubscriptionInvoice) {
    Object.assign(this, props);
  }
}

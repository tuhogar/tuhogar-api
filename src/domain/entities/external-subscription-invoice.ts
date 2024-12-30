export enum ExternalSubscriptionInvoiceStatus {
  UNKNOWN = 'UNKNOWN',
  SCHEDULED = 'SCHEDULED',
  PROCESSED = 'PROCESSED',
  RECYCLING = 'RECYCLING',
  CANCELLED = 'CANCELLED',
}

export class ExternalSubscriptionInvoice {
  id?: string;
  public status: ExternalSubscriptionInvoiceStatus;
  public payload: Record<string, any>;

  constructor(props: ExternalSubscriptionInvoice) {
    Object.assign(this, props);
  }
}
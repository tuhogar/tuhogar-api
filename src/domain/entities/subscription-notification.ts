export enum SubscriptionNotificationType {
  UNKNOWN = 'UNKNOWN',
  SUBSCRIPTION = 'SUBSCRIPTION',
  INVOICE = 'INVOICE',
  PAYMENT = 'PAYMENT',
  INVOICE_AND_PAYMENT = 'INVOICE_AND_PAYMENT',
}

export enum SubscriptionNotificationAction {
  UNKNOWN = 'UNKNOWN',
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
}

export class SubscriptionNotification {
  id?: string;
  public type: SubscriptionNotificationType;
  public action: SubscriptionNotificationAction;
  public payload: Record<string, any>;
  public subscription?: Record<string, any>;
  public payment?: Record<string, any>;
  public invoice?: Record<string, any>;

  constructor(props: SubscriptionNotification) {
    Object.assign(this, props);
  }
}
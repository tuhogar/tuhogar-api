export enum ExternalSubscriptionPaymentStatus {
  UNKNOWN = 'UNKNOWN',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  AUTHORIZED = 'AUTHORIZED',
  IN_PROCESS = 'IN_PROCESS',
  IN_MEDIATION = 'IN_MEDIATION',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  CHARGED_BACK = 'CHARGED_BACK'
}

export class ExternalSubscriptionPayment {
  id?: string;
  public status: ExternalSubscriptionPaymentStatus;
  public payload: Record<string, any>;

  constructor(props: ExternalSubscriptionPayment) {
    Object.assign(this, props);
  }
}
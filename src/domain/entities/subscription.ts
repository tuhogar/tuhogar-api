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

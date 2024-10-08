import { Subscription } from 'src/domain/entities/subscription';

export abstract class ISubscriptionRepository {
  abstract create(subscription: Subscription): Promise<Subscription>;
  abstract findByIdAndUpdate(id: string, subscription: Subscription): Promise<Subscription>;
  abstract findById(id: string): Promise<Subscription | null>;
  abstract findByAccountId(accountId: string): Promise<Subscription>;
  abstract cancel(id: string): Promise<Subscription>;
}

import { Subscription } from 'src/domain/entities/subscription';

export abstract class ISubscriptionRepository {
  abstract create(subscription: Subscription): Promise<Subscription>;
  abstract findById(id: string): Promise<Subscription | null>;
  abstract findByAccountId(accountId: string): Promise<Subscription>;
  abstract findByExternalId(externalId: string): Promise<Subscription>;
  abstract findByExternalPayerReference(externalPayerReference: string): Promise<Subscription>;
  abstract cancel(id: string): Promise<Subscription>;
  abstract active(id: string): Promise<Subscription>;
  abstract pause(id: string): Promise<Subscription>;
  abstract pending(id: string): Promise<Subscription>;
}

import { Subscription } from 'src/domain/entities/subscription';

export abstract class ISubscriptionRepository {
  abstract create(subscription: Subscription): Promise<Subscription>;
  abstract findOneById(id: string): Promise<Subscription | null>;
  abstract findOneWithResultIntegrationById(id: string): Promise<Subscription>;
  abstract findOneActiveOrCreatedByAccountId(accountId: string): Promise<Subscription>;
  abstract findOneByExternalId(externalId: string): Promise<Subscription>;
  abstract findOneByExternalPayerReference(externalPayerReference: string): Promise<Subscription>;
  abstract cancel(id: string): Promise<Subscription>;
  abstract active(id: string): Promise<Subscription>;
  abstract updateExternalReferences(id: string, externalId: string, externalPayerReference: string, resultIntegration: Record<string, any>): Promise<Subscription>;
  abstract delete(id: string): Promise<void>;
  abstract updatePlan(id: string, planId: string): Promise<Subscription>;
}

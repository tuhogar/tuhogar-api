import { Subscription, SubscriptionStatus } from 'src/domain/entities/subscription';

export abstract class ISubscriptionRepository {
  abstract create(subscription: Subscription): Promise<Subscription>;
  abstract findOneById(id: string): Promise<Subscription | null>;
  abstract findOneWithResultIntegrationById(id: string): Promise<Subscription>;
  abstract findOneActiveOrCreatedByAccountId(accountId: string): Promise<Subscription>;
  abstract findOneActiveByAccountId(accountId: string): Promise<Subscription>
  abstract findOneByExternalId(externalId: string): Promise<Subscription>;
  abstract findOneByExternalPayerReference(externalPayerReference: string): Promise<Subscription>;
  abstract cancel(id: string): Promise<Subscription>;
  abstract cancelOnPaymentGateway(id: string, effectiveCancellationDate: Date): Promise<Subscription>;
  abstract active(id: string): Promise<Subscription>;
  abstract pending(id: string): Promise<Subscription>;
  abstract updateExternalReferences(id: string, externalId: string, externalPayerReference: string, resultIntegration: Record<string, any>, status: SubscriptionStatus, nextPaymentDate?: Date): Promise<Subscription>;
  abstract delete(id: string): Promise<void>;
  abstract updatePlan(id: string, planId: string): Promise<Subscription>;
  abstract findSubscriptionsToCancel(currentDate: Date): Promise<Subscription[]>;
  abstract updatePaymentDate(id: string, paymentDate: Date): Promise<Subscription>;
  abstract updateNextPaymentDate(id: string, nextPaymentDate: Date): Promise<Subscription>;
  abstract findMostRecentByAccountId(accountId: string): Promise<Subscription>;
}

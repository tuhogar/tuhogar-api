import { SubscriptionStatus } from 'src/domain/entities/subscription';
import { SubscriptionPaymentStatus } from 'src/domain/entities/subscription-payment';
import { SubscriptionPaymentWithSubscription } from 'src/domain/entities/subscription-payment-with-subscription';
import { GetSubscriptionPaymentHistoryOutputDtoMapper } from './get-subscription-payment-history.output.dto.mapper';

describe('GetSubscriptionPaymentHistoryOutputDtoMapper', () => {
  describe('toOutputDto', () => {
    it('should convert a SubscriptionPaymentWithSubscription to GetSubscriptionPaymentHistoryOutputDto', () => {
      // Arrange
      const payment: SubscriptionPaymentWithSubscription = {
        id: '123',
        accountId: 'account123',
        subscriptionId: 'subscription123',
        externalId: 'ext123',
        type: 'subscription',
        method: 'VS',
        description: 'Monthly payment',
        amount: 10000,
        currency: 'COP',
        status: SubscriptionPaymentStatus.APPROVED,
        paymentDate: new Date('2023-01-01'),
        subscription: {
          id: 'subscription123',
          accountId: 'account123',
          planId: 'plan123',
          status: SubscriptionStatus.ACTIVE,
          nextPaymentDate: new Date('2023-02-01'),
          plan: {
            id: 'plan123',
            name: 'Elite',
            price: 29990,
            items: ['item1', 'item2'],
            freeTrialDays: 7,
            photo: 'photo.jpg',
            externalId: 'ext-plan-123'
          }
        }
      };

      // Act
      const result = GetSubscriptionPaymentHistoryOutputDtoMapper.toOutputDto(payment);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe('123');
      expect(result.method).toBe('VS');
      expect(result.amount).toBe(10000);
      expect(result.currency).toBe('COP');
      expect(result.status).toBe(SubscriptionPaymentStatus.APPROVED);
      expect(result.paymentDate).toEqual(new Date('2023-01-01'));
      
      // Check subscription data
      expect(result.subscription).toBeDefined();
      expect(result.subscription.id).toBe('subscription123');
      expect(result.subscription.status).toBe(SubscriptionStatus.ACTIVE);
      expect(result.subscription.nextPaymentDate).toEqual(new Date('2023-02-01'));
      
      // Check plan data
      expect(result.subscription.plan).toBeDefined();
      expect(result.subscription.plan.id).toBe('plan123');
      expect(result.subscription.plan.name).toBe('Elite');
      expect(result.subscription.plan.price).toBe(29990);
    });

    it('should handle null values correctly', () => {
      // Arrange
      const payment: SubscriptionPaymentWithSubscription = {
        id: '123',
        accountId: 'account123',
        subscriptionId: 'subscription123',
        externalId: 'ext123',
        type: 'subscription',
        method: 'VS',
        description: 'Monthly payment',
        amount: 10000,
        currency: 'COP',
        status: SubscriptionPaymentStatus.APPROVED,
        paymentDate: null,
        subscription: {
          id: 'subscription123',
          accountId: 'account123',
          planId: 'plan123',
          status: SubscriptionStatus.ACTIVE,
          nextPaymentDate: null,
          plan: null
        }
      };

      // Act
      const result = GetSubscriptionPaymentHistoryOutputDtoMapper.toOutputDto(payment);

      // Assert
      expect(result).toBeDefined();
      expect(result.paymentDate).toBeNull();
      expect(result.subscription.nextPaymentDate).toBeNull();
      expect(result.subscription.plan).toBeNull();
    });

    it('should handle payment without subscription', () => {
      // Arrange
      const payment: SubscriptionPaymentWithSubscription = {
        id: '123',
        accountId: 'account123',
        subscriptionId: 'subscription123',
        externalId: 'ext123',
        type: 'subscription',
        method: 'VS',
        description: 'Monthly payment',
        amount: 10000,
        currency: 'COP',
        status: SubscriptionPaymentStatus.APPROVED,
        paymentDate: new Date('2023-01-01'),
        subscription: undefined
      };

      // Act
      const result = GetSubscriptionPaymentHistoryOutputDtoMapper.toOutputDto(payment);

      // Assert
      expect(result).toBeDefined();
      expect(result.subscription).toBeNull();
    });
  });

  describe('toOutputDtoList', () => {
    it('should convert an array of SubscriptionPaymentWithSubscription to an array of GetSubscriptionPaymentHistoryOutputDto', () => {
      // Arrange
      const payments: SubscriptionPaymentWithSubscription[] = [
        {
          id: '123',
          accountId: 'account123',
          subscriptionId: 'subscription123',
          externalId: 'ext123',
          type: 'subscription',
          method: 'VS',
          description: 'Monthly payment',
          amount: 10000,
          currency: 'COP',
          status: SubscriptionPaymentStatus.APPROVED,
          paymentDate: new Date('2023-01-01'),
          subscription: {
            id: 'subscription123',
            accountId: 'account123',
            planId: 'plan123',
            status: SubscriptionStatus.ACTIVE,
            nextPaymentDate: new Date('2023-02-01'),
            plan: {
              id: 'plan123',
              name: 'Elite',
              price: 29990,
              items: ['item1', 'item2'],
              freeTrialDays: 7,
              photo: 'photo.jpg',
              externalId: 'ext-plan-123'
            }
          }
        },
        {
          id: '456',
          accountId: 'account123',
          subscriptionId: 'subscription456',
          externalId: 'ext456',
          type: 'subscription',
          method: 'MC',
          description: 'Monthly payment',
          amount: 15000,
          currency: 'COP',
          status: SubscriptionPaymentStatus.APPROVED,
          paymentDate: new Date('2023-02-01'),
          subscription: {
            id: 'subscription456',
            accountId: 'account123',
            planId: 'plan456',
            status: SubscriptionStatus.ACTIVE,
            nextPaymentDate: new Date('2023-03-01'),
            plan: {
              id: 'plan456',
              name: 'Premium',
              price: 39990,
              items: ['item1', 'item2', 'item3'],
              freeTrialDays: 0,
              photo: null,
              externalId: 'ext-plan-456'
            }
          }
        }
      ];

      // Act
      const result = GetSubscriptionPaymentHistoryOutputDtoMapper.toOutputDtoList(payments);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      expect(result[0].id).toBe('123');
      expect(result[1].id).toBe('456');
    });

    it('should return an empty array when input is null', () => {
      // Act
      const result = GetSubscriptionPaymentHistoryOutputDtoMapper.toOutputDtoList(null);

      // Assert
      expect(result).toEqual([]);
    });

    it('should return an empty array when input is an empty array', () => {
      // Act
      const result = GetSubscriptionPaymentHistoryOutputDtoMapper.toOutputDtoList([]);

      // Assert
      expect(result).toEqual([]);
    });
  });
});

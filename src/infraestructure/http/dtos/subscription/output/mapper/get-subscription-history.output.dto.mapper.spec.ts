import { GetSubscriptionHistoryOutputDtoMapper } from './get-subscription-history.output.dto.mapper';
import { SubscriptionWithPayments } from 'src/domain/entities/subscription-with-payments';
import { Subscription } from 'src/domain/entities/subscription';
import { SubscriptionPayment } from 'src/domain/entities/subscription-payment';
import { Plan } from 'src/domain/entities/plan';
import { SubscriptionStatus } from 'src/domain/entities/subscription';
import { SubscriptionPaymentStatus } from 'src/domain/entities/subscription-payment';

describe('GetSubscriptionHistoryOutputDtoMapper', () => {
  // Mock para o plano
  const mockPlan: Plan = {
    id: 'plan-id',
    name: 'Plano Premium',
    freeTrialDays: 30,
    items: ['Item 1', 'Item 2'],
    price: 99.99,
    externalId: 'external-plan-id',
    maxAdvertisements: 10,
    maxPhotos: 20
  } as Plan;

  // Mock para os pagamentos
  const mockPayments: SubscriptionPayment[] = [
    {
      id: 'payment-id-1',
      subscriptionId: 'subscription-id',
      accountId: 'account-id',
      externalId: 'external-payment-id-1',
      type: 'subscription',
      method: 'credit_card',
      description: 'Pagamento mensal - Plano Premium',
      amount: 99.99,
      currency: 'COP',
      status: SubscriptionPaymentStatus.APPROVED,
      paymentDate: new Date('2025-04-20T00:00:00Z')
    } as SubscriptionPayment,
    {
      id: 'payment-id-2',
      subscriptionId: 'subscription-id',
      accountId: 'account-id',
      externalId: 'external-payment-id-2',
      type: 'subscription',
      method: 'credit_card',
      description: 'Pagamento mensal - Plano Premium',
      amount: 99.99,
      currency: 'COP',
      status: SubscriptionPaymentStatus.APPROVED,
      paymentDate: new Date('2025-05-20T00:00:00Z')
    } as SubscriptionPayment
  ];

  // Mock para a assinatura com pagamentos
  const mockSubscriptionWithPayments: SubscriptionWithPayments = {
    id: 'subscription-id',
    accountId: 'account-id',
    planId: 'plan-id',
    status: SubscriptionStatus.ACTIVE,
    externalId: 'external-id',
    externalPayerReference: 'external-payer-reference',
    createdAt: new Date('2025-04-20T00:00:00Z'),
    updatedAt: new Date('2025-04-20T00:00:00Z'),
    paymentDate: new Date('2025-04-20T00:00:00Z'),
    plan: mockPlan,
    payments: mockPayments
  } as SubscriptionWithPayments;

  // Mock para a lista de assinaturas com pagamentos
  const mockSubscriptionsWithPayments: SubscriptionWithPayments[] = [
    mockSubscriptionWithPayments,
    {
      ...mockSubscriptionWithPayments,
      id: 'subscription-id-2',
      status: SubscriptionStatus.CANCELLED,
      payments: [mockPayments[0]]
    } as SubscriptionWithPayments
  ];

  describe('toOutputDto', () => {
    it('should convert a SubscriptionWithPayments entity to a GetSubscriptionHistoryOutputDto', () => {
      // Act
      const result = GetSubscriptionHistoryOutputDtoMapper.toOutputDto(mockSubscriptionWithPayments);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toEqual(mockSubscriptionWithPayments.id);
      expect(result.planId).toEqual(mockSubscriptionWithPayments.planId);
      expect(result.status).toEqual(mockSubscriptionWithPayments.status);
      expect(result.paymentDate).toEqual(mockSubscriptionWithPayments.paymentDate);
      expect(result.createdAt).toEqual(mockSubscriptionWithPayments.createdAt);
      
      // Verificar o plano
      expect(result.plan).toBeDefined();
      expect(result.plan.id).toEqual(mockPlan.id);
      expect(result.plan.name).toEqual(mockPlan.name);
      expect(result.plan.price).toEqual(mockPlan.price);
      expect(result.plan.freeTrialDays).toEqual(mockPlan.freeTrialDays);
      
      // Verificar os pagamentos
      expect(result.payments).toBeDefined();
      expect(result.payments.length).toEqual(2);
      
      // Verificar o primeiro pagamento
      expect(result.payments[0].id).toEqual(mockPayments[0].id);
      expect(result.payments[0].subscriptionId).toEqual(mockPayments[0].subscriptionId);
      expect(result.payments[0].accountId).toEqual(mockPayments[0].accountId);
      expect(result.payments[0].externalId).toEqual(mockPayments[0].externalId);
      expect(result.payments[0].type).toEqual(mockPayments[0].type);
      expect(result.payments[0].method).toEqual(mockPayments[0].method);
      expect(result.payments[0].description).toEqual(mockPayments[0].description);
      expect(result.payments[0].amount).toEqual(mockPayments[0].amount);
      expect(result.payments[0].currency).toEqual(mockPayments[0].currency);
      expect(result.payments[0].status).toEqual(mockPayments[0].status);
      expect(result.payments[0].paymentDate).toEqual(mockPayments[0].paymentDate);
      
      // Verificar o segundo pagamento
      expect(result.payments[1].id).toEqual(mockPayments[1].id);
    });

    it('should handle null values properly', () => {
      // Arrange
      const subscriptionWithNullValues: SubscriptionWithPayments = {
        ...mockSubscriptionWithPayments,
        paymentDate: null,
        plan: null,
        payments: null
      } as unknown as SubscriptionWithPayments;

      // Act
      const result = GetSubscriptionHistoryOutputDtoMapper.toOutputDto(subscriptionWithNullValues);

      // Assert
      expect(result).toBeDefined();
      expect(result.paymentDate).toBeNull();
      expect(result.plan).toBeNull();
      expect(result.payments).toEqual([]);
    });
  });

  describe('toOutputDtoList', () => {
    it('should convert a list of SubscriptionWithPayments entities to a list of GetSubscriptionHistoryOutputDto', () => {
      // Act
      const result = GetSubscriptionHistoryOutputDtoMapper.toOutputDtoList(mockSubscriptionsWithPayments);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toEqual(2);
      
      // Verificar a primeira assinatura
      expect(result[0].id).toEqual(mockSubscriptionsWithPayments[0].id);
      expect(result[0].status).toEqual(SubscriptionStatus.ACTIVE);
      expect(result[0].payments.length).toEqual(2);
      
      // Verificar a segunda assinatura
      expect(result[1].id).toEqual(mockSubscriptionsWithPayments[1].id);
      expect(result[1].status).toEqual(SubscriptionStatus.CANCELLED);
      expect(result[1].payments.length).toEqual(1);
    });

    it('should return an empty array when input is empty', () => {
      // Act
      const result = GetSubscriptionHistoryOutputDtoMapper.toOutputDtoList([]);

      // Assert
      expect(result).toBeDefined();
      expect(result).toEqual([]);
    });

    it('should return an empty array when input is null', () => {
      // Act
      const result = GetSubscriptionHistoryOutputDtoMapper.toOutputDtoList(null);

      // Assert
      expect(result).toBeDefined();
      expect(result).toEqual([]);
    });
  });
});

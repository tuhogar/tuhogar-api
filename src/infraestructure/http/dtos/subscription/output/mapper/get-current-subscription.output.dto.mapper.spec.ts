import { Plan } from 'src/domain/entities/plan';
import { SubscriptionStatus } from 'src/domain/entities/subscription';
import { SubscriptionWithRemainingFreeDays } from 'src/domain/entities/subscription-with-remaining-free-days';
import { GetCurrentSubscriptionOutputDto } from '../get-current-subscription.output.dto';
import { GetCurrentSubscriptionOutputDtoMapper } from './get-current-subscription.output.dto.mapper';

describe('GetCurrentSubscriptionOutputDtoMapper', () => {
  describe('toOutputDto', () => {
    it('deve mapear corretamente uma entidade SubscriptionWithRemainingFreeDays para GetCurrentSubscriptionOutputDto', () => {
      // Arrange
      const mockDate = new Date('2025-05-01T10:00:00Z');
      const mockPlan = new Plan({
        id: 'plan-789',
        name: 'Plano Premium',
        freeTrialDays: 30,
        items: ['Item 1', 'Item 2'],
        price: 99.90,
        photo: 'https://example.com/photo.jpg',
        externalId: 'ext-plan-123',
        maxAdvertisements: 10,
        maxPhotos: 20
      });

      const mockSubscription: SubscriptionWithRemainingFreeDays = {
        id: 'subscription-123',
        accountId: 'account-456',
        planId: 'plan-789',
        status: SubscriptionStatus.ACTIVE,
        externalId: 'ext-123',
        externalPayerReference: 'payer-123',
        resultIntegration: { success: true },
        effectiveCancellationDate: mockDate,
        paymentDate: mockDate,
        nextPaymentDate: mockDate,
        createdAt: mockDate,
        updatedAt: mockDate,
        remainingFreeDays: 5,
        plan: mockPlan
      };

      // Act
      const result = GetCurrentSubscriptionOutputDtoMapper.toOutputDto(mockSubscription);

      // Assert
      expect(result).toBeDefined();
      expect(result).toBeInstanceOf(Object);
      expect(result.id).toBe('subscription-123');
      expect(result.planId).toBe('plan-789');
      expect(result.status).toBe(SubscriptionStatus.ACTIVE);
      expect(result.effectiveCancellationDate).toEqual(mockDate);
      expect(result.paymentDate).toEqual(mockDate);
      expect(result.nextPaymentDate).toEqual(mockDate);
      expect(result.createdAt).toEqual(mockDate);
      expect(result.remainingFreeDays).toBe(5);
      
      // Verificar o objeto plan
      expect(result.plan).toBeDefined();
      expect(result.plan.id).toBe('plan-789');
      expect(result.plan.name).toBe('Plano Premium');
      expect(result.plan.price).toBe(99.90);
      expect(result.plan.items).toEqual(['Item 1', 'Item 2']);
      expect(result.plan.freeTrialDays).toBe(30);
      expect(result.plan.photo).toBe('https://example.com/photo.jpg');
    });

    it('deve lidar corretamente com propriedades opcionais ausentes', () => {
      // Arrange
      const mockSubscription: SubscriptionWithRemainingFreeDays = {
        id: undefined,
        accountId: 'account-456',
        planId: 'plan-789',
        status: SubscriptionStatus.ACTIVE,
        remainingFreeDays: 5,
        plan: undefined
      };

      // Act
      const result = GetCurrentSubscriptionOutputDtoMapper.toOutputDto(mockSubscription);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBeUndefined();
      expect(result.planId).toBe('plan-789');
      expect(result.status).toBe(SubscriptionStatus.ACTIVE);
      expect(result.effectiveCancellationDate).toBeNull();
      expect(result.paymentDate).toBeNull();
      expect(result.nextPaymentDate).toBeNull();
      expect(result.createdAt).toBeNull();
      expect(result.remainingFreeDays).toBe(5);
      expect(result.plan).toBeNull();
    });

    it('deve retornar um objeto que implementa a interface GetCurrentSubscriptionOutputDto', () => {
      // Arrange
      const mockSubscription: SubscriptionWithRemainingFreeDays = {
        id: 'subscription-123',
        accountId: 'account-456',
        planId: 'plan-789',
        status: SubscriptionStatus.ACTIVE,
        remainingFreeDays: 5,
        plan: null
      };

      // Act
      const result = GetCurrentSubscriptionOutputDtoMapper.toOutputDto(mockSubscription);

      // Assert
      const dtoKeys = Object.keys(result);
      expect(dtoKeys).toContain('id');
      expect(dtoKeys).toContain('planId');
      expect(dtoKeys).toContain('status');
      expect(dtoKeys).toContain('effectiveCancellationDate');
      expect(dtoKeys).toContain('paymentDate');
      expect(dtoKeys).toContain('nextPaymentDate');
      expect(dtoKeys).toContain('createdAt');
      expect(dtoKeys).toContain('remainingFreeDays');
      expect(dtoKeys).toContain('plan');
      
      // Verificar que não contém propriedades que não devem estar no DTO
      expect(dtoKeys).not.toContain('accountId');
      expect(dtoKeys).not.toContain('externalId');
      expect(dtoKeys).not.toContain('externalPayerReference');
      expect(dtoKeys).not.toContain('resultIntegration');
      expect(dtoKeys).not.toContain('updatedAt');
    });
  });

  describe('toOutputDto com diferentes cenários de plan', () => {
    it('deve mapear corretamente quando plan tem propriedades opcionais ausentes', () => {
      // Arrange
      const mockPlan = new Plan({
        id: 'plan-789',
        name: 'Plano Básico',
        items: ['Item 1'],
        price: 49.90,
        externalId: 'ext-plan-123'
      });

      const mockSubscription: SubscriptionWithRemainingFreeDays = {
        id: 'subscription-123',
        accountId: 'account-456',
        planId: 'plan-789',
        status: SubscriptionStatus.ACTIVE,
        remainingFreeDays: 5,
        plan: mockPlan
      };

      // Act
      const result = GetCurrentSubscriptionOutputDtoMapper.toOutputDto(mockSubscription);

      // Assert
      expect(result.plan).toBeDefined();
      expect(result.plan.id).toBe('plan-789');
      expect(result.plan.name).toBe('Plano Básico');
      expect(result.plan.price).toBe(49.90);
      expect(result.plan.items).toEqual(['Item 1']);
      expect(result.plan.freeTrialDays).toBeNull();
      expect(result.plan.photo).toBeNull();
    });
  });
});

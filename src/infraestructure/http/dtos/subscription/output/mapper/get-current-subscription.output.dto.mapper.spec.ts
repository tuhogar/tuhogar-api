import { SubscriptionStatus } from 'src/domain/entities/subscription';
import { SubscriptionWithRemainingFreeDays } from 'src/domain/entities/subscription-with-remaining-free-days';
import { GetCurrentSubscriptionOutputDto } from '../get-current-subscription.output.dto';
import { GetCurrentSubscriptionOutputDtoMapper } from './get-current-subscription.output.dto.mapper';

describe('GetCurrentSubscriptionOutputDtoMapper', () => {
  describe('toOutputDto', () => {
    it('deve mapear corretamente uma entidade SubscriptionWithRemainingFreeDays para GetCurrentSubscriptionOutputDto', () => {
      // Arrange
      const mockDate = new Date('2025-05-01T10:00:00Z');
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
        remainingFreeDays: 5
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
    });

    it('deve lidar corretamente com propriedades opcionais ausentes', () => {
      // Arrange
      const mockSubscription: SubscriptionWithRemainingFreeDays = {
        id: undefined,
        accountId: 'account-456',
        planId: 'plan-789',
        status: SubscriptionStatus.ACTIVE,
        remainingFreeDays: 5
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
    });

    it('deve retornar um objeto que implementa a interface GetCurrentSubscriptionOutputDto', () => {
      // Arrange
      const mockSubscription: SubscriptionWithRemainingFreeDays = {
        id: 'subscription-123',
        accountId: 'account-456',
        planId: 'plan-789',
        status: SubscriptionStatus.ACTIVE,
        remainingFreeDays: 5
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
      
      // Verificar que não contém propriedades que não devem estar no DTO
      expect(dtoKeys).not.toContain('accountId');
      expect(dtoKeys).not.toContain('externalId');
      expect(dtoKeys).not.toContain('externalPayerReference');
      expect(dtoKeys).not.toContain('resultIntegration');
      expect(dtoKeys).not.toContain('updatedAt');
    });
  });
});

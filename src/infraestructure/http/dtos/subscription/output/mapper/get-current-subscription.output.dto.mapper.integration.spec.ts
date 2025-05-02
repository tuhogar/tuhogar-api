import { SubscriptionStatus } from 'src/domain/entities/subscription';
import { SubscriptionWithRemainingFreeDays } from 'src/domain/entities/subscription-with-remaining-free-days';
import { GetCurrentSubscriptionOutputDto } from '../get-current-subscription.output.dto';
import { GetCurrentSubscriptionOutputDtoMapper } from './get-current-subscription.output.dto.mapper';

/**
 * Testes de integração para o mapeador GetCurrentSubscriptionOutputDtoMapper
 * 
 * Estes testes validam que o mapeador produz um DTO de saída que:
 * 1. Contém todas as propriedades necessárias para a API
 * 2. Não expõe propriedades internas que não devem ser expostas
 * 3. Lida corretamente com valores nulos ou indefinidos
 */
describe('GetCurrentSubscriptionOutputDtoMapper Integration', () => {
  describe('Validação do formato de resposta da API', () => {
    it('deve produzir um DTO com o formato exato esperado pela API', () => {
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
      // Verificar que o resultado tem exatamente as propriedades esperadas
      const expectedProperties = [
        'id', 'planId', 'status', 'effectiveCancellationDate',
        'paymentDate', 'nextPaymentDate', 'createdAt', 'remainingFreeDays'
      ];
      
      const resultProperties = Object.keys(result);
      
      // Verificar que o resultado tem exatamente as propriedades esperadas, nem mais nem menos
      expect(resultProperties.length).toBe(expectedProperties.length);
      expectedProperties.forEach(prop => {
        expect(resultProperties).toContain(prop);
      });
      
      // Verificar que propriedades internas não são expostas
      expect(resultProperties).not.toContain('accountId');
      expect(resultProperties).not.toContain('externalId');
      expect(resultProperties).not.toContain('externalPayerReference');
      expect(resultProperties).not.toContain('resultIntegration');
      expect(resultProperties).not.toContain('updatedAt');
      
      // Verificar que o resultado é do tipo correto
      expect(result).toBeInstanceOf(Object);
      
      // Verificar que os valores foram mapeados corretamente
      expect(result.id).toBe('subscription-123');
      expect(result.planId).toBe('plan-789');
      expect(result.status).toBe(SubscriptionStatus.ACTIVE);
      expect(result.effectiveCancellationDate).toEqual(mockDate);
      expect(result.paymentDate).toEqual(mockDate);
      expect(result.nextPaymentDate).toEqual(mockDate);
      expect(result.createdAt).toEqual(mockDate);
      expect(result.remainingFreeDays).toBe(5);
    });

    it('deve lidar corretamente com valores nulos ou indefinidos', () => {
      // Arrange
      const mockMinimalSubscription: SubscriptionWithRemainingFreeDays = {
        id: undefined,
        accountId: 'account-456',
        planId: 'plan-789',
        status: SubscriptionStatus.ACTIVE,
        remainingFreeDays: 0
      };

      // Act
      const result = GetCurrentSubscriptionOutputDtoMapper.toOutputDto(mockMinimalSubscription);

      // Assert
      expect(result.id).toBeUndefined();
      expect(result.planId).toBe('plan-789');
      expect(result.status).toBe(SubscriptionStatus.ACTIVE);
      expect(result.effectiveCancellationDate).toBeNull();
      expect(result.paymentDate).toBeNull();
      expect(result.nextPaymentDate).toBeNull();
      expect(result.createdAt).toBeNull();
      expect(result.remainingFreeDays).toBe(0);
    });

    it('deve garantir que o DTO de saída segue o contrato da API', () => {
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

      // Assert - Verificar que o resultado pode ser serializado para JSON sem problemas
      const serialized = JSON.stringify(result);
      const deserialized = JSON.parse(serialized);
      
      // Verificar que a serialização/deserialização mantém a estrutura
      expect(deserialized.id).toBe('subscription-123');
      expect(deserialized.planId).toBe('plan-789');
      expect(deserialized.status).toBe(SubscriptionStatus.ACTIVE);
      expect(deserialized.remainingFreeDays).toBe(5);
      
      // Verificar que as datas são serializadas corretamente (como null neste caso)
      expect(deserialized.effectiveCancellationDate).toBeNull();
      expect(deserialized.paymentDate).toBeNull();
      expect(deserialized.nextPaymentDate).toBeNull();
      expect(deserialized.createdAt).toBeNull();
    });
  });
});

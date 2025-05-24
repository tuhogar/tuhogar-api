import { Plan } from 'src/domain/entities/plan';
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
      // Verificar que o resultado tem exatamente as propriedades esperadas
      const expectedProperties = [
        'id', 'planId', 'status', 'effectiveCancellationDate',
        'paymentDate', 'nextPaymentDate', 'createdAt', 'remainingFreeDays', 'plan'
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
      
      // Verificar o objeto plan
      expect(result.plan).toBeDefined();
      expect(result.plan.id).toBe('plan-789');
      expect(result.plan.name).toBe('Plano Premium');
      expect(result.plan.price).toBe(99.90);
      expect(result.plan.items).toEqual(['Item 1', 'Item 2']);
      expect(result.plan.freeTrialDays).toBe(30);
      expect(result.plan.photo).toBe('https://example.com/photo.jpg');
    });

    it('deve lidar corretamente com valores nulos ou indefinidos', () => {
      // Arrange
      const mockMinimalSubscription: SubscriptionWithRemainingFreeDays = {
        id: undefined,
        accountId: 'account-456',
        planId: 'plan-789',
        status: SubscriptionStatus.ACTIVE,
        remainingFreeDays: 0,
        plan: undefined
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
      expect(result.plan).toBeNull();
    });

    it('deve garantir que o DTO de saída segue o contrato da API', () => {
      // Arrange
      const mockPlanMinimal = new Plan({
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
        plan: mockPlanMinimal
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
      
      // Verificar que o objeto plan é serializado corretamente
      expect(deserialized.plan).toBeDefined();
      expect(deserialized.plan.id).toBe('plan-789');
      expect(deserialized.plan.name).toBe('Plano Básico');
      expect(deserialized.plan.price).toBe(49.90);
      expect(deserialized.plan.items).toEqual(['Item 1']);
      expect(deserialized.plan.freeTrialDays).toBeNull();
      expect(deserialized.plan.photo).toBeNull();
    });
  });

  describe('Validação específica do objeto plan', () => {
    it('deve mapear corretamente o objeto plan com todas as propriedades', () => {
      // Arrange
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
        remainingFreeDays: 5,
        plan: mockPlan
      };

      // Act
      const result = GetCurrentSubscriptionOutputDtoMapper.toOutputDto(mockSubscription);

      // Assert
      expect(result.plan).toBeDefined();
      
      // Verificar que o objeto plan tem exatamente as propriedades esperadas
      const planProperties = Object.keys(result.plan);
      const expectedPlanProperties = ['id', 'name', 'price', 'items', 'freeTrialDays', 'photo'];
      
      expect(planProperties.length).toBe(expectedPlanProperties.length);
      expectedPlanProperties.forEach(prop => {
        expect(planProperties).toContain(prop);
      });
      
      // Verificar que propriedades internas do Plan não são expostas
      expect(planProperties).not.toContain('externalId');
      expect(planProperties).not.toContain('maxAdvertisements');
      expect(planProperties).not.toContain('maxPhotos');
    });

    it('deve lidar corretamente com plan nulo', () => {
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
      expect(result.plan).toBeNull();
    });
  });
});

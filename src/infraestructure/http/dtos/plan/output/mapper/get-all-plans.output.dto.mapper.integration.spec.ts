import { Plan } from 'src/domain/entities/plan';
import { GetAllPlansOutputDto } from '../get-all-plans.output.dto';
import { GetAllPlansOutputDtoMapper } from './get-all-plans.output.dto.mapper';

/**
 * Testes de integração para o mapeador GetAllPlansOutputDtoMapper
 * 
 * Estes testes validam que o mapeador produz um DTO de saída que:
 * 1. Contém todas as propriedades necessárias para a API
 * 2. Não expõe propriedades internas que não devem ser expostas
 * 3. Lida corretamente com valores nulos ou indefinidos
 */
describe('GetAllPlansOutputDtoMapper Integration', () => {
  describe('Validação do formato de resposta da API', () => {
    it('deve produzir um DTO com o formato exato esperado pela API', () => {
      // Arrange
      const mockPlan = new Plan({
        id: 'plan-123',
        name: 'Plano Premium',
        freeTrialDays: 30,
        items: ['Item 1', 'Item 2'],
        price: 99.90,
        photo: 'https://example.com/photo.jpg',
        externalId: 'external-plan-id',
        maxAdvertisements: 10,
        maxPhotos: 20
      });

      // Act
      const result = GetAllPlansOutputDtoMapper.toOutputDto(mockPlan);

      // Assert
      // Verificar que o resultado tem exatamente as propriedades esperadas
      const expectedProperties = [
        'id', 'name', 'freeTrialDays', 'items', 'price', 'photo'
      ];
      
      const resultProperties = Object.keys(result);
      
      // Verificar que o resultado tem exatamente as propriedades esperadas, nem mais nem menos
      expect(resultProperties.length).toBe(expectedProperties.length);
      expectedProperties.forEach(prop => {
        expect(resultProperties).toContain(prop);
      });
      
      // Verificar que propriedades internas não são expostas
      expect(resultProperties).not.toContain('externalId');
      expect(resultProperties).not.toContain('maxAdvertisements');
      expect(resultProperties).not.toContain('maxPhotos');
      
      // Verificar que o resultado é do tipo correto
      expect(result).toBeInstanceOf(Object);
      
      // Verificar que os valores foram mapeados corretamente
      expect(result.id).toBe('plan-123');
      expect(result.name).toBe('Plano Premium');
      expect(result.freeTrialDays).toBe(30);
      expect(result.items).toEqual(['Item 1', 'Item 2']);
      expect(result.price).toBe(99.90);
      expect(result.photo).toBe('https://example.com/photo.jpg');
    });

    it('deve lidar corretamente com valores nulos ou indefinidos', () => {
      // Arrange
      const mockMinimalPlan = new Plan({
        id: undefined,
        name: 'Plano Básico',
        items: [],
        price: 49.90,
        externalId: 'external-plan-id'
      });

      // Act
      const result = GetAllPlansOutputDtoMapper.toOutputDto(mockMinimalPlan);

      // Assert
      expect(result.id).toBeUndefined();
      expect(result.name).toBe('Plano Básico');
      expect(result.freeTrialDays).toBeNull();
      expect(result.items).toEqual([]);
      expect(result.price).toBe(49.90);
      expect(result.photo).toBeNull();
    });

    it('deve garantir que o DTO de saída segue o contrato da API', () => {
      // Arrange
      const mockPlan = new Plan({
        id: 'plan-123',
        name: 'Plano Premium',
        freeTrialDays: 30,
        items: ['Item 1', 'Item 2'],
        price: 99.90,
        photo: 'https://example.com/photo.jpg',
        externalId: 'external-plan-id',
        maxAdvertisements: 10,
        maxPhotos: 20
      });

      // Act
      const result = GetAllPlansOutputDtoMapper.toOutputDto(mockPlan);

      // Assert - Verificar que o resultado pode ser serializado para JSON sem problemas
      const serialized = JSON.stringify(result);
      const deserialized = JSON.parse(serialized);
      
      // Verificar que a serialização/deserialização mantém a estrutura
      expect(deserialized.id).toBe('plan-123');
      expect(deserialized.name).toBe('Plano Premium');
      expect(deserialized.freeTrialDays).toBe(30);
      expect(deserialized.items).toEqual(['Item 1', 'Item 2']);
      expect(deserialized.price).toBe(99.90);
      expect(deserialized.photo).toBe('https://example.com/photo.jpg');
      
      // Verificar que propriedades internas não são expostas após serialização
      expect(deserialized.externalId).toBeUndefined();
      expect(deserialized.maxAdvertisements).toBeUndefined();
      expect(deserialized.maxPhotos).toBeUndefined();
    });
  });

  describe('Validação da lista de DTOs', () => {
    it('deve produzir uma lista de DTOs com o formato correto', () => {
      // Arrange
      const mockPlans = [
        new Plan({
          id: 'plan-1',
          name: 'Plano Premium',
          freeTrialDays: 30,
          items: ['Item 1', 'Item 2'],
          price: 99.90,
          photo: 'https://example.com/photo1.jpg',
          externalId: 'external-plan-1'
        }),
        new Plan({
          id: 'plan-2',
          name: 'Plano Básico',
          items: ['Item 1'],
          price: 49.90,
          externalId: 'external-plan-2'
        })
      ];

      // Act
      const results = GetAllPlansOutputDtoMapper.toOutputDtoList(mockPlans);

      // Assert
      expect(results).toHaveLength(2);
      
      // Verificar que cada item da lista é um DTO válido
      results.forEach(result => {
        const resultProperties = Object.keys(result);
        expect(resultProperties).toContain('id');
        expect(resultProperties).toContain('name');
        expect(resultProperties).toContain('freeTrialDays');
        expect(resultProperties).toContain('items');
        expect(resultProperties).toContain('price');
        expect(resultProperties).toContain('photo');
        
        // Verificar que propriedades internas não são expostas
        expect(resultProperties).not.toContain('externalId');
        expect(resultProperties).not.toContain('maxAdvertisements');
        expect(resultProperties).not.toContain('maxPhotos');
      });
      
      // Verificar que a lista pode ser serializada para JSON sem problemas
      const serialized = JSON.stringify(results);
      const deserialized = JSON.parse(serialized);
      
      expect(deserialized).toHaveLength(2);
      expect(deserialized[0].name).toBe('Plano Premium');
      expect(deserialized[1].name).toBe('Plano Básico');
    });
  });
});

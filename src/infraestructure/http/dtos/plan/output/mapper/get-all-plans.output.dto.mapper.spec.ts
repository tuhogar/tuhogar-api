import { Plan } from 'src/domain/entities/plan';
import { GetAllPlansOutputDto } from '../get-all-plans.output.dto';
import { GetAllPlansOutputDtoMapper } from './get-all-plans.output.dto.mapper';

describe('GetAllPlansOutputDtoMapper', () => {
  describe('toOutputDto', () => {
    it('deve mapear corretamente uma entidade Plan para GetAllPlansOutputDto', () => {
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
      expect(result).toBeDefined();
      expect(result.id).toBe('plan-123');
      expect(result.name).toBe('Plano Premium');
      expect(result.freeTrialDays).toBe(30);
      expect(result.items).toEqual(['Item 1', 'Item 2']);
      expect(result.price).toBe(99.90);
      expect(result.photo).toBe('https://example.com/photo.jpg');
      
      // Verificar que propriedades internas não são expostas
      expect((result as any).externalId).toBeUndefined();
      expect((result as any).maxAdvertisements).toBeUndefined();
      expect((result as any).maxPhotos).toBeUndefined();
    });

    it('deve lidar corretamente com propriedades opcionais ausentes', () => {
      // Arrange
      const mockPlanWithoutOptionals = new Plan({
        id: 'plan-123',
        name: 'Plano Básico',
        items: ['Item 1'],
        price: 49.90,
        externalId: 'external-plan-id'
      });

      // Act
      const result = GetAllPlansOutputDtoMapper.toOutputDto(mockPlanWithoutOptionals);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe('plan-123');
      expect(result.name).toBe('Plano Básico');
      expect(result.freeTrialDays).toBeNull();
      expect(result.items).toEqual(['Item 1']);
      expect(result.price).toBe(49.90);
      expect(result.photo).toBeNull();
    });

    it('deve retornar null quando o plano for null', () => {
      // Act
      const result = GetAllPlansOutputDtoMapper.toOutputDto(null);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('toOutputDtoList', () => {
    it('deve mapear corretamente uma lista de entidades Plan para lista de GetAllPlansOutputDto', () => {
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
      const result = GetAllPlansOutputDtoMapper.toOutputDtoList(mockPlans);

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toBe(2);
      
      // Verificar primeiro plano
      expect(result[0].id).toBe('plan-1');
      expect(result[0].name).toBe('Plano Premium');
      expect(result[0].freeTrialDays).toBe(30);
      expect(result[0].photo).toBe('https://example.com/photo1.jpg');
      
      // Verificar segundo plano
      expect(result[1].id).toBe('plan-2');
      expect(result[1].name).toBe('Plano Básico');
      expect(result[1].freeTrialDays).toBeNull();
      expect(result[1].photo).toBeNull();
    });

    it('deve retornar array vazio quando a lista de planos for null ou não for um array', () => {
      // Act & Assert
      expect(GetAllPlansOutputDtoMapper.toOutputDtoList(null)).toEqual([]);
      expect(GetAllPlansOutputDtoMapper.toOutputDtoList(undefined)).toEqual([]);
      expect(GetAllPlansOutputDtoMapper.toOutputDtoList({} as any)).toEqual([]);
    });
  });
});

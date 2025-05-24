import { MongooseAccountAdvertisementStatisticsMapper } from './mongoose-account-advertisement-statistics.mapper';
import { AccountAdvertisementStatistics } from '../../../../domain/entities/account-advertisement-statistics';
import * as mongoose from 'mongoose';

describe('MongooseAccountAdvertisementStatisticsMapper', () => {
  const mockId = new mongoose.Types.ObjectId();
  const mockAccountId = new mongoose.Types.ObjectId();
  const mockMonth = '2025-03';
  const mockCreatedAt = new Date('2025-04-01T00:00:00Z');

  // Mock para o documento do Mongoose
  const mockMongooseDocument = {
    _id: mockId,
    accountId: mockAccountId,
    month: mockMonth,
    createdAt: mockCreatedAt,
    totalAdvertisements: {
      total: 10,
      byTransactionType: {
        sale: 6,
        rent: 4
      },
      byPropertyTypeAndTransaction: {
        house: { sale: 3, rent: 2 },
        apartment: { sale: 2, rent: 1 },
        lot: { sale: 1, rent: 1 }
      }
    },
    totalVisits: {
      total: 100,
      byTransactionType: {
        sale: 60,
        rent: 40
      },
      byPropertyTypeAndTransaction: {
        house: { sale: 30, rent: 20 },
        apartment: { sale: 20, rent: 10 },
        lot: { sale: 10, rent: 10 }
      }
    },
    phoneClicks: {
      total: 20,
      byTransactionType: {
        sale: 12,
        rent: 8
      },
      byPropertyTypeAndTransaction: {
        house: { sale: 6, rent: 4 },
        apartment: { sale: 4, rent: 2 },
        lot: { sale: 2, rent: 2 }
      }
    },
    digitalCatalogViews: 15,
    contactInfoClicks: {
      total: 30,
      byTransactionType: {
        sale: 18,
        rent: 12
      },
      byPropertyTypeAndTransaction: {
        house: { sale: 9, rent: 6 },
        apartment: { sale: 6, rent: 3 },
        lot: { sale: 3, rent: 3 }
      }
    },
    topViewedAdvertisements: {
      sale: [
        { advertisementId: 'ad1', views: 50 },
        { advertisementId: 'ad2', views: 40 }
      ],
      rent: [
        { advertisementId: 'ad3', views: 30 },
        { advertisementId: 'ad4', views: 20 }
      ]
    },
    topInteractedAdvertisements: {
      sale: [
        { advertisementId: 'ad1', interactions: 25 },
        { advertisementId: 'ad2', interactions: 20 }
      ],
      rent: [
        { advertisementId: 'ad3', interactions: 15 },
        { advertisementId: 'ad4', interactions: 10 }
      ]
    }
  };

  // Mock para a entidade de domínio
  const mockDomainEntity = new AccountAdvertisementStatistics({
    id: mockId.toString(),
    accountId: mockAccountId.toString(),
    month: mockMonth,
    createdAt: mockCreatedAt,
    totalAdvertisements: {
      total: 10,
      byTransactionType: {
        sale: 6,
        rent: 4
      },
      byPropertyTypeAndTransaction: {
        house: { sale: 3, rent: 2 },
        apartment: { sale: 2, rent: 1 },
        lot: { sale: 1, rent: 1 }
      }
    },
    totalVisits: {
      total: 100,
      byTransactionType: {
        sale: 60,
        rent: 40
      },
      byPropertyTypeAndTransaction: {
        house: { sale: 30, rent: 20 },
        apartment: { sale: 20, rent: 10 },
        lot: { sale: 10, rent: 10 }
      }
    },
    phoneClicks: {
      total: 20,
      byTransactionType: {
        sale: 12,
        rent: 8
      },
      byPropertyTypeAndTransaction: {
        house: { sale: 6, rent: 4 },
        apartment: { sale: 4, rent: 2 },
        lot: { sale: 2, rent: 2 }
      }
    },
    digitalCatalogViews: 15,
    contactInfoClicks: {
      total: 30,
      byTransactionType: {
        sale: 18,
        rent: 12
      },
      byPropertyTypeAndTransaction: {
        house: { sale: 9, rent: 6 },
        apartment: { sale: 6, rent: 3 },
        lot: { sale: 3, rent: 3 }
      }
    },
    topViewedAdvertisements: {
      sale: [
        { advertisementId: 'ad1', views: 50 },
        { advertisementId: 'ad2', views: 40 }
      ],
      rent: [
        { advertisementId: 'ad3', views: 30 },
        { advertisementId: 'ad4', views: 20 }
      ]
    },
    topInteractedAdvertisements: {
      sale: [
        { advertisementId: 'ad1', interactions: 25 },
        { advertisementId: 'ad2', interactions: 20 }
      ],
      rent: [
        { advertisementId: 'ad3', interactions: 15 },
        { advertisementId: 'ad4', interactions: 10 }
      ]
    }
  });

  describe('toDomain', () => {
    it('should convert mongoose document to domain entity', () => {
      // Act
      const result = MongooseAccountAdvertisementStatisticsMapper.toDomain(mockMongooseDocument as any);

      // Assert
      expect(result).toBeInstanceOf(AccountAdvertisementStatistics);
      expect(result.id).toBe(mockId.toString());
      expect(result.accountId).toBe(mockAccountId.toString());
      expect(result.month).toBe(mockMonth);
      expect(result.createdAt).toEqual(mockCreatedAt);
      
      // Verificar métricas
      expect(result.totalAdvertisements.total).toBe(10);
      expect(result.totalAdvertisements.byTransactionType.sale).toBe(6);
      expect(result.totalAdvertisements.byTransactionType.rent).toBe(4);
      expect(result.totalAdvertisements.byPropertyTypeAndTransaction.house.sale).toBe(3);
      
      // Verificar top anúncios
      expect(result.topViewedAdvertisements.sale[0].advertisementId).toBe('ad1');
      expect(result.topViewedAdvertisements.sale[0].views).toBe(50);
      expect(result.topInteractedAdvertisements.rent[1].advertisementId).toBe('ad4');
      expect(result.topInteractedAdvertisements.rent[1].interactions).toBe(10);
    });

    it('should return null when document is null', () => {
      // Act
      const result = MongooseAccountAdvertisementStatisticsMapper.toDomain(null);

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('toMongoose', () => {
    it('should convert domain entity to mongoose document', () => {
      // Act
      const result = MongooseAccountAdvertisementStatisticsMapper.toMongoose(mockDomainEntity);

      // Assert
      expect(result).toBeDefined();
      expect(result.accountId).toBe(mockAccountId.toString());
      expect(result.month).toBe(mockMonth);
      expect(result.createdAt).toEqual(mockCreatedAt);
      
      // Verificar métricas
      expect(result.totalAdvertisements.total).toBe(10);
      expect(result.totalAdvertisements.byTransactionType.sale).toBe(6);
      expect(result.totalAdvertisements.byTransactionType.rent).toBe(4);
      expect(result.totalAdvertisements.byPropertyTypeAndTransaction.house.sale).toBe(3);
      
      // Verificar top anúncios
      expect(result.topViewedAdvertisements.sale[0].advertisementId).toBe('ad1');
      expect(result.topViewedAdvertisements.sale[0].views).toBe(50);
      expect(result.topInteractedAdvertisements.rent[1].advertisementId).toBe('ad4');
      expect(result.topInteractedAdvertisements.rent[1].interactions).toBe(10);
    });

    it('should handle null or undefined properties gracefully', () => {
      // Arrange
      const partialEntity = new AccountAdvertisementStatistics({
        id: mockId.toString(),
        accountId: mockAccountId.toString(),
        month: mockMonth,
        createdAt: mockCreatedAt,
        // Omitindo outras propriedades para testar a resiliência
      });

      // Act
      const result = MongooseAccountAdvertisementStatisticsMapper.toMongoose(partialEntity);

      // Assert
      expect(result).toBeDefined();
      expect(result.accountId).toBe(mockAccountId.toString());
      expect(result.month).toBe(mockMonth);
      expect(result.totalAdvertisements).toBeDefined();
      expect(result.totalAdvertisements.total).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('should handle empty arrays in top advertisements', () => {
      // Arrange
      const entityWithEmptyArrays = new AccountAdvertisementStatistics({
        ...mockDomainEntity,
        topViewedAdvertisements: {
          sale: [],
          rent: []
        },
        topInteractedAdvertisements: {
          sale: [],
          rent: []
        }
      });

      // Act
      const result = MongooseAccountAdvertisementStatisticsMapper.toMongoose(entityWithEmptyArrays);

      // Assert
      expect(result.topViewedAdvertisements.sale).toEqual([]);
      expect(result.topViewedAdvertisements.rent).toEqual([]);
      expect(result.topInteractedAdvertisements.sale).toEqual([]);
      expect(result.topInteractedAdvertisements.rent).toEqual([]);
    });
  });
});

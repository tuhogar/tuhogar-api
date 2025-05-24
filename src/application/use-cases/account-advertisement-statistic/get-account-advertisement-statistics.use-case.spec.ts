import { Test, TestingModule } from '@nestjs/testing';
import { GetAccountAdvertisementStatisticsUseCase } from './get-account-advertisement-statistics.use-case';
import { IAccountAdvertisementStatisticsRepository } from '../../../application/interfaces/repositories/account-advertisement-statistics.repository.interface';
import { AccountAdvertisementStatistics } from '../../../domain/entities/account-advertisement-statistics';

describe('GetAccountAdvertisementStatisticsUseCase', () => {
  let useCase: GetAccountAdvertisementStatisticsUseCase;
  let mockRepository: jest.Mocked<IAccountAdvertisementStatisticsRepository>;

  const mockAccountId = 'mock-account-id';
  const mockMonth = '2025-03';

  const mockStatistics = new AccountAdvertisementStatistics({
    id: 'mock-id',
    accountId: mockAccountId,
    month: mockMonth,
    createdAt: new Date(),
    totalAdvertisements: {
      total: 10,
      byTransactionType: { sale: 6, rent: 4 },
      byPropertyTypeAndTransaction: {
        house: { sale: 3, rent: 2 },
        apartment: { sale: 2, rent: 1 },
        lot: { sale: 1, rent: 1 }
      }
    },
    totalVisits: {
      total: 100,
      byTransactionType: { sale: 60, rent: 40 },
      byPropertyTypeAndTransaction: {
        house: { sale: 30, rent: 20 },
        apartment: { sale: 20, rent: 10 },
        lot: { sale: 10, rent: 10 }
      }
    },
    phoneClicks: {
      total: 20,
      byTransactionType: { sale: 12, rent: 8 },
      byPropertyTypeAndTransaction: {
        house: { sale: 6, rent: 4 },
        apartment: { sale: 4, rent: 2 },
        lot: { sale: 2, rent: 2 }
      }
    },
    digitalCatalogViews: 15,
    contactInfoClicks: {
      total: 30,
      byTransactionType: { sale: 18, rent: 12 },
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

  const mockStatisticsList = [
    mockStatistics,
    new AccountAdvertisementStatistics({
      ...mockStatistics,
      id: 'mock-id-2',
      month: '2025-02'
    })
  ];

  beforeEach(async () => {
    mockRepository = {
      findByAccountIdAndMonth: jest.fn(),
      findAllByAccountId: jest.fn(),
      create: jest.fn(),
    } as unknown as jest.Mocked<IAccountAdvertisementStatisticsRepository>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAccountAdvertisementStatisticsUseCase,
        {
          provide: IAccountAdvertisementStatisticsRepository,
          useValue: mockRepository
        }
      ],
    }).compile();

    useCase = module.get<GetAccountAdvertisementStatisticsUseCase>(GetAccountAdvertisementStatisticsUseCase);
  });

  describe('execute', () => {
    it('should call getByMonth when month is provided', async () => {
      // Arrange
      const getByMonthSpy = jest.spyOn(useCase, 'getByMonth').mockResolvedValue(mockStatistics);
      
      // Act
      await useCase.execute({ accountId: mockAccountId, month: mockMonth });
      
      // Assert
      expect(getByMonthSpy).toHaveBeenCalledWith(mockAccountId, mockMonth);
    });

    it('should call getAllByAccount when month is not provided', async () => {
      // Arrange
      const getAllByAccountSpy = jest.spyOn(useCase, 'getAllByAccount').mockResolvedValue(mockStatisticsList);
      
      // Act
      await useCase.execute({ accountId: mockAccountId });
      
      // Assert
      expect(getAllByAccountSpy).toHaveBeenCalledWith(mockAccountId);
    });
  });

  describe('getByMonth', () => {
    it('should return statistics when they exist', async () => {
      // Arrange
      mockRepository.findByAccountIdAndMonth.mockResolvedValue(mockStatistics);
      
      // Act
      const result = await useCase.getByMonth(mockAccountId, mockMonth);
      
      // Assert
      expect(mockRepository.findByAccountIdAndMonth).toHaveBeenCalledWith(mockAccountId, mockMonth);
      expect(result).toEqual(mockStatistics);
    });

    it('should throw an error when statistics do not exist', async () => {
      // Arrange
      mockRepository.findByAccountIdAndMonth.mockResolvedValue(null);
      
      // Act & Assert
      await expect(useCase.getByMonth(mockAccountId, mockMonth))
        .rejects
        .toThrow('notfound.account.advertisement.statistics.do.not.exists');
    });
  });

  describe('getAllByAccount', () => {
    it('should return all statistics when they exist', async () => {
      // Arrange
      mockRepository.findAllByAccountId.mockResolvedValue(mockStatisticsList);
      
      // Act
      const result = await useCase.getAllByAccount(mockAccountId);
      
      // Assert
      expect(mockRepository.findAllByAccountId).toHaveBeenCalledWith(mockAccountId);
      expect(result).toEqual(mockStatisticsList);
    });

    it('should throw an error when no statistics exist', async () => {
      // Arrange
      mockRepository.findAllByAccountId.mockResolvedValue([]);
      
      // Act & Assert
      await expect(useCase.getAllByAccount(mockAccountId))
        .rejects
        .toThrow('notfound.account.advertisement.statistics.do.not.exists');
    });

    it('should throw an error when statistics are null', async () => {
      // Arrange
      mockRepository.findAllByAccountId.mockResolvedValue(null);
      
      // Act & Assert
      await expect(useCase.getAllByAccount(mockAccountId))
        .rejects
        .toThrow('notfound.account.advertisement.statistics.do.not.exists');
    });
  });
});

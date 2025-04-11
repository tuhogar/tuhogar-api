import { Test, TestingModule } from '@nestjs/testing';
import { GenerateMonthlyStatisticsUseCase } from './generate-monthly-statistics.use-case';
import { IAccountRepository } from '../../../application/interfaces/repositories/account.repository.interface';
import { IAdvertisementRepository } from '../../../application/interfaces/repositories/advertisement.repository.interface';
import { IAdvertisementEventRepository } from '../../../application/interfaces/repositories/advertisement-event.repository.interface';
import { IAccountAdvertisementStatisticsRepository } from '../../../application/interfaces/repositories/account-advertisement-statistics.repository.interface';
import { Account, AccountStatus } from '../../../domain/entities/account';
import { Advertisement, AdvertisementTransactionType, AdvertisementType } from '../../../domain/entities/advertisement';
import { AdvertisementEvent } from '../../../domain/entities/advertisement-event';
import { AccountAdvertisementStatistics } from '../../../domain/entities/account-advertisement-statistics';
import { Logger } from '@nestjs/common';

describe('GenerateMonthlyStatisticsUseCase', () => {
  let useCase: GenerateMonthlyStatisticsUseCase;
  let mockAccountRepository: jest.Mocked<IAccountRepository>;
  let mockAdvertisementRepository: jest.Mocked<IAdvertisementRepository>;
  let mockAdvertisementEventRepository: jest.Mocked<IAdvertisementEventRepository>;
  let mockAccountAdvertisementStatisticsRepository: jest.Mocked<IAccountAdvertisementStatisticsRepository>;

  const mockMonth = '2025-03';
  const mockAccountId = 'mock-account-id';

  const mockAccount = {
    id: mockAccountId,
    name: 'Mock Account',
    email: 'mock@example.com',
    status: AccountStatus.ACTIVE,
    planId: 'plan-id',
    phone: '123456789',
    documentType: 'CC',
    documentNumber: '123456789'
  } as Account;

  const mockAdvertisements = [
    {
      id: 'ad1',
      accountId: mockAccountId,
      code: 123,
      description: 'Beautiful house',
      transactionType: AdvertisementTransactionType.SALE,
      type: AdvertisementType.HOUSE,
      advertisementEvents: [
        {
          id: 'event1',
          advertisementId: 'ad1',
          type: 'AD_VIEW',
          count: 1
        },
        {
          id: 'event2',
          advertisementId: 'ad1',
          type: 'AD_PHONE_CLICK',
          count: 1
        }
      ],
      status: 'ACTIVE',
      createdUserId: 'user1',
      updatedUserId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'ad2',
      accountId: mockAccountId,
      code: 456,
      description: 'Modern apartment',
      transactionType: AdvertisementTransactionType.RENT,
      type: AdvertisementType.APARTMENT,
      advertisementEvents: [
        {
          id: 'event3',
          advertisementId: 'ad2',
          type: 'AD_VIEW',
          count: 1
        },
        {
          id: 'event4',
          advertisementId: 'ad2',
          type: 'AD_CONTACT_CLICK',
          count: 1
        }
      ],
      status: 'ACTIVE',
      createdUserId: 'user1',
      updatedUserId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ] as Advertisement[];

  const mockStatistics = {
    id: 'mock-stats-id',
    accountId: mockAccountId,
    month: mockMonth,
    createdAt: new Date(),
    totalAdvertisements: {
      total: 2,
      byTransactionType: { sale: 1, rent: 1 },
      byPropertyTypeAndTransaction: {
        house: { sale: 1, rent: 0 },
        apartment: { sale: 0, rent: 1 },
        lot: { sale: 0, rent: 0 }
      }
    },
    totalVisits: {
      total: 2,
      byTransactionType: { sale: 1, rent: 1 },
      byPropertyTypeAndTransaction: {
        house: { sale: 1, rent: 0 },
        apartment: { sale: 0, rent: 1 },
        lot: { sale: 0, rent: 0 }
      }
    },
    phoneClicks: {
      total: 1,
      byTransactionType: { sale: 1, rent: 0 },
      byPropertyTypeAndTransaction: {
        house: { sale: 1, rent: 0 },
        apartment: { sale: 0, rent: 0 },
        lot: { sale: 0, rent: 0 }
      }
    },
    digitalCatalogViews: 0,
    contactInfoClicks: {
      total: 1,
      byTransactionType: { sale: 0, rent: 1 },
      byPropertyTypeAndTransaction: {
        house: { sale: 0, rent: 0 },
        apartment: { sale: 0, rent: 1 },
        lot: { sale: 0, rent: 0 }
      }
    },
    topViewedAdvertisements: {
      sale: [
        { advertisementId: 'ad1', views: 1 }
      ],
      rent: [
        { advertisementId: 'ad2', views: 1 }
      ]
    },
    topInteractedAdvertisements: {
      sale: [
        { advertisementId: 'ad1', interactions: 1 }
      ],
      rent: [
        { advertisementId: 'ad2', interactions: 1 }
      ]
    }
  } as AccountAdvertisementStatistics;

  beforeEach(async () => {
    // Criando mocks para os repositórios
    mockAccountRepository = {
      findOneById: jest.fn(),
      findActives: jest.fn()
    } as unknown as jest.Mocked<IAccountRepository>;

    mockAdvertisementRepository = {
      findByAccountIdWithEvents: jest.fn()
    } as unknown as jest.Mocked<IAdvertisementRepository>;

    mockAdvertisementEventRepository = {
      findByAdvertisementIdsAndMonth: jest.fn()
    } as unknown as jest.Mocked<IAdvertisementEventRepository>;

    mockAccountAdvertisementStatisticsRepository = {
      findByAccountIdAndMonth: jest.fn(),
      create: jest.fn()
    } as unknown as jest.Mocked<IAccountAdvertisementStatisticsRepository>;

    // Mock do Logger para evitar logs durante os testes
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateMonthlyStatisticsUseCase,
        {
          provide: IAccountRepository,
          useValue: mockAccountRepository
        },
        {
          provide: IAdvertisementRepository,
          useValue: mockAdvertisementRepository
        },
        {
          provide: IAdvertisementEventRepository,
          useValue: mockAdvertisementEventRepository
        },
        {
          provide: IAccountAdvertisementStatisticsRepository,
          useValue: mockAccountAdvertisementStatisticsRepository
        }
      ],
    }).compile();

    useCase = module.get<GenerateMonthlyStatisticsUseCase>(GenerateMonthlyStatisticsUseCase);
    
    // Mock para o método getPreviousMonth para retornar um valor fixo
    jest.spyOn(useCase as any, 'getPreviousMonth').mockReturnValue(mockMonth);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should generate statistics for a specific account', async () => {
      // Arrange
      mockAccountRepository.findOneById.mockResolvedValue(mockAccount);
      mockAdvertisementRepository.findByAccountIdWithEvents.mockResolvedValue({ data: mockAdvertisements, count: mockAdvertisements.length });
      mockAccountAdvertisementStatisticsRepository.findByAccountIdAndMonth.mockResolvedValue(null);
      mockAccountAdvertisementStatisticsRepository.create.mockResolvedValue(mockStatistics);
      
      const generateStatisticsSpy = jest.spyOn(useCase as any, 'generateStatisticsForAccount');
      
      // Act
      await useCase.execute({ accountId: mockAccountId, month: mockMonth });
      
      // Assert
      expect(mockAccountRepository.findOneById).toHaveBeenCalledWith(mockAccountId);
      expect(generateStatisticsSpy).toHaveBeenCalledWith(mockAccount, mockMonth);
    });

    it('should throw an error when account is not found', async () => {
      // Arrange
      mockAccountRepository.findOneById.mockResolvedValue(null);
      
      // Act & Assert
      await expect(useCase.execute({ accountId: mockAccountId, month: mockMonth }))
        .rejects
        .toThrow('notfound.account.do.not.exists');
    });

    it('should generate statistics for all active accounts', async () => {
      // Arrange
      const mockAccounts = [mockAccount, { ...mockAccount, id: 'account2' }];
      mockAccountRepository.findActives.mockResolvedValue(mockAccounts);
      mockAdvertisementRepository.findByAccountIdWithEvents.mockResolvedValue({ data: mockAdvertisements, count: mockAdvertisements.length });
      mockAccountAdvertisementStatisticsRepository.findByAccountIdAndMonth.mockResolvedValue(null);
      mockAccountAdvertisementStatisticsRepository.create.mockResolvedValue(mockStatistics);
      
      const generateStatisticsSpy = jest.spyOn(useCase as any, 'generateStatisticsForAccount');
      
      // Act
      await useCase.execute({ month: mockMonth });
      
      // Assert
      expect(mockAccountRepository.findActives).toHaveBeenCalled();
      expect(generateStatisticsSpy).toHaveBeenCalledTimes(mockAccounts.length);
    });

    it('should continue processing other accounts when one fails', async () => {
      // Arrange
      const mockAccounts = [mockAccount, { ...mockAccount, id: 'account2' }];
      mockAccountRepository.findActives.mockResolvedValue(mockAccounts);
      
      // Primeiro account gera erro, segundo é processado normalmente
      const generateStatisticsSpy = jest.spyOn(useCase as any, 'generateStatisticsForAccount')
        .mockRejectedValueOnce(new Error('Test error'))
        .mockResolvedValueOnce(mockStatistics);
      
      // Act
      await useCase.execute({ month: mockMonth });
      
      // Assert
      expect(generateStatisticsSpy).toHaveBeenCalledTimes(mockAccounts.length);
      // Verifica que o erro foi registrado mas não interrompeu o processamento
      expect(Logger.prototype.error).toHaveBeenCalled();
    });
  });

  describe('generateStatisticsForAccount', () => {
    it('should return existing statistics if they already exist', async () => {
      // Arrange
      mockAccountAdvertisementStatisticsRepository.findByAccountIdAndMonth.mockResolvedValue(mockStatistics);
      
      // Act
      const result = await (useCase as any).generateStatisticsForAccount(mockAccount, mockMonth);
      
      // Assert
      expect(mockAccountAdvertisementStatisticsRepository.findByAccountIdAndMonth).toHaveBeenCalledWith(mockAccountId, mockMonth);
      expect(result).toEqual(mockStatistics);
      expect(mockAdvertisementRepository.findByAccountIdWithEvents).not.toHaveBeenCalled();
    });

    it('should create empty statistics when no advertisements are found', async () => {
      // Arrange
      mockAccountAdvertisementStatisticsRepository.findByAccountIdAndMonth.mockResolvedValue(null);
      mockAdvertisementRepository.findByAccountIdWithEvents.mockResolvedValue({ data: [], count: 0 });
      
      const createEmptyStatisticsSpy = jest.spyOn(useCase as any, 'createEmptyStatistics')
        .mockResolvedValue(mockStatistics);
      
      // Act
      await (useCase as any).generateStatisticsForAccount(mockAccount, mockMonth);
      
      // Assert
      expect(createEmptyStatisticsSpy).toHaveBeenCalledWith(mockAccountId, mockMonth);
    });

    it('should calculate metrics and create statistics when advertisements exist', async () => {
      // Arrange
      mockAccountAdvertisementStatisticsRepository.findByAccountIdAndMonth.mockResolvedValue(null);
      mockAdvertisementRepository.findByAccountIdWithEvents.mockResolvedValue({ data: mockAdvertisements, count: mockAdvertisements.length });
      mockAccountAdvertisementStatisticsRepository.create.mockResolvedValue(mockStatistics);
      
      const calculateMetricsSpy = jest.spyOn(useCase as any, 'calculateMetrics')
        .mockReturnValue({
          totalAdvertisements: mockStatistics.totalAdvertisements,
          totalVisits: mockStatistics.totalVisits,
          phoneClicks: mockStatistics.phoneClicks,
          digitalCatalogViews: mockStatistics.digitalCatalogViews,
          contactInfoClicks: mockStatistics.contactInfoClicks,
          topViewedAdvertisements: mockStatistics.topViewedAdvertisements,
          topInteractedAdvertisements: mockStatistics.topInteractedAdvertisements
        });
      
      // Act
      const result = await (useCase as any).generateStatisticsForAccount(mockAccount, mockMonth);
      
      // Assert
      expect(mockAdvertisementRepository.findByAccountIdWithEvents).toHaveBeenCalledWith(
        mockAccountId, 1, 10000, null, null, null, null
      );
      expect(calculateMetricsSpy).toHaveBeenCalledWith(mockAdvertisements);
      expect(mockAccountAdvertisementStatisticsRepository.create).toHaveBeenCalled();
      expect(result).toEqual(mockStatistics);
    });
  });

  describe('executeScheduled', () => {
    it('should call execute method without parameters', async () => {
      // Arrange
      const executeSpy = jest.spyOn(useCase, 'execute').mockResolvedValue();
      
      // Act
      await useCase.executeScheduled();
      
      // Assert
      expect(executeSpy).toHaveBeenCalledWith();
    });

    it('should log error but not propagate it', async () => {
      // Arrange
      const testError = new Error('Test error');
      jest.spyOn(useCase, 'execute').mockRejectedValue(testError);
      
      // Act & Assert
      await expect(useCase.executeScheduled()).resolves.not.toThrow();
      expect(Logger.prototype.error).toHaveBeenCalled();
    });
  });
});

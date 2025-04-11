import { Test, TestingModule } from '@nestjs/testing';
import { AdvertisementStatisticsController } from './advertisement-statistics.controller';
import { GetAccountAdvertisementStatisticsUseCase } from 'src/application/use-cases/account-advertisement-statistic/get-account-advertisement-statistics.use-case';
import { GenerateMonthlyStatisticsUseCase } from 'src/application/use-cases/account-advertisement-statistic/generate-monthly-statistics.use-case';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user';
import { UserRole, UserStatus } from 'src/domain/entities/user';
import { AccountStatus } from 'src/domain/entities/account';
import { SubscriptionStatus } from 'src/domain/entities/subscription';
import { AccountAdvertisementStatistics } from 'src/domain/entities/account-advertisement-statistics';
import { GetAllAdvertisementStatisticsDto } from '../dtos/advertisement-statistics/get-all-advertisement-statistics.dto';
import { GetAdvertisementStatisticsByMonthDto } from '../dtos/advertisement-statistics/get-advertisement-statistics-by-month.dto';
import { GenerateAdvertisementStatisticsDto } from '../dtos/advertisement-statistics/generate-advertisement-statistics.dto';

// Mock dos decoradores
jest.mock('src/infraestructure/decorators/auth.decorator', () => ({
  Auth: (...roles: string[]) => jest.fn(),
}));

jest.mock('src/infraestructure/decorators/authenticated.decorator', () => ({
  Authenticated: () => jest.fn((target: any, key: string, index: number) => {}),
}));

describe('AdvertisementStatisticsController', () => {
  let controller: AdvertisementStatisticsController;
  let getAccountAdvertisementStatisticsUseCase: jest.Mocked<GetAccountAdvertisementStatisticsUseCase>;
  let generateMonthlyStatisticsUseCase: jest.Mocked<GenerateMonthlyStatisticsUseCase>;

  const mockAccountId = '6073a75d56a1f3001f9d5a2b';
  const mockMonth = '2025-04';
  
  // Mock para a entidade de estatísticas
  const mockStatistics: AccountAdvertisementStatistics = {
    id: '1',
    accountId: mockAccountId,
    month: mockMonth,
    createdAt: new Date(),
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

  // Mock para usuário autenticado
  const mockUserAuthenticated: AuthenticatedUser = {
    userId: 'user1',
    uid: 'uid1',
    email: 'user@example.com',
    userStatus: UserStatus.ACTIVE,
    accountId: mockAccountId,
    accountStatus: AccountStatus.ACTIVE,
    userRole: UserRole.USER,
    planId: 'plan1',
    subscriptionId: 'sub1',
    subscriptionStatus: SubscriptionStatus.ACTIVE
  };

  const mockMasterAuthenticated: AuthenticatedUser = {
    userId: 'master1',
    uid: 'uid2',
    email: 'master@example.com',
    userStatus: UserStatus.ACTIVE,
    accountId: 'master-account',
    accountStatus: AccountStatus.ACTIVE,
    userRole: UserRole.MASTER,
    planId: 'plan1',
    subscriptionId: 'sub1',
    subscriptionStatus: SubscriptionStatus.ACTIVE
  };

  beforeEach(async () => {
    // Criar mocks para os casos de uso
    const getAccountAdvertisementStatisticsUseCaseMock = {
      execute: jest.fn(),
      getAllByAccount: jest.fn(),
      getByMonth: jest.fn()
    };
    
    const generateMonthlyStatisticsUseCaseMock = {
      execute: jest.fn()
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdvertisementStatisticsController],
      providers: [
        {
          provide: GetAccountAdvertisementStatisticsUseCase,
          useValue: getAccountAdvertisementStatisticsUseCaseMock
        },
        {
          provide: GenerateMonthlyStatisticsUseCase,
          useValue: generateMonthlyStatisticsUseCaseMock
        }
      ]
    }).compile();

    controller = module.get<AdvertisementStatisticsController>(AdvertisementStatisticsController);
    getAccountAdvertisementStatisticsUseCase = module.get(GetAccountAdvertisementStatisticsUseCase) as jest.Mocked<GetAccountAdvertisementStatisticsUseCase>;
    generateMonthlyStatisticsUseCase = module.get(GenerateMonthlyStatisticsUseCase) as jest.Mocked<GenerateMonthlyStatisticsUseCase>;
  });

  describe('getAll', () => {
    it('should return all statistics for a USER role', async () => {
      // Arrange
      const query: GetAllAdvertisementStatisticsDto = {};
      const mockStatisticsList = [mockStatistics];
      getAccountAdvertisementStatisticsUseCase.getAllByAccount.mockResolvedValue(mockStatisticsList);
      
      // Act
      const result = await controller.getAll(mockUserAuthenticated, query);
      
      // Assert
      expect(result).toEqual(mockStatisticsList);
      expect(getAccountAdvertisementStatisticsUseCase.getAllByAccount).toHaveBeenCalledWith(mockAccountId);
    });

    it('should return statistics for a specific account when MASTER role', async () => {
      // Arrange
      const query: GetAllAdvertisementStatisticsDto = { accountId: mockAccountId };
      const mockStatisticsList = [mockStatistics];
      getAccountAdvertisementStatisticsUseCase.getAllByAccount.mockResolvedValue(mockStatisticsList);
      
      // Act
      const result = await controller.getAll(mockMasterAuthenticated, query);
      
      // Assert
      expect(result).toEqual(mockStatisticsList);
      expect(getAccountAdvertisementStatisticsUseCase.getAllByAccount).toHaveBeenCalledWith(mockAccountId);
    });

    it('should throw error when MASTER role without accountId', async () => {
      // Arrange
      const query: GetAllAdvertisementStatisticsDto = {};
      
      // Act & Assert
      await expect(controller.getAll(mockMasterAuthenticated, query))
        .rejects
        .toThrow('invalid.accountId.should.not.be.empty');
      expect(getAccountAdvertisementStatisticsUseCase.getAllByAccount).not.toHaveBeenCalled();
    });
  });

  describe('getByMonth', () => {
    it('should return statistics for a specific month for USER role', async () => {
      // Arrange
      const params: GetAdvertisementStatisticsByMonthDto = { month: mockMonth };
      const query: GetAllAdvertisementStatisticsDto = {};
      getAccountAdvertisementStatisticsUseCase.getByMonth.mockResolvedValue(mockStatistics);
      
      // Act
      const result = await controller.getByMonth(mockUserAuthenticated, params, query);
      
      // Assert
      expect(result).toEqual(mockStatistics);
      expect(getAccountAdvertisementStatisticsUseCase.getByMonth).toHaveBeenCalledWith(mockAccountId, mockMonth);
    });

    it('should return statistics for a specific month and account when MASTER role', async () => {
      // Arrange
      const params: GetAdvertisementStatisticsByMonthDto = { month: mockMonth };
      const query: GetAllAdvertisementStatisticsDto = { accountId: mockAccountId };
      getAccountAdvertisementStatisticsUseCase.getByMonth.mockResolvedValue(mockStatistics);
      
      // Act
      const result = await controller.getByMonth(mockMasterAuthenticated, params, query);
      
      // Assert
      expect(result).toEqual(mockStatistics);
      expect(getAccountAdvertisementStatisticsUseCase.getByMonth).toHaveBeenCalledWith(mockAccountId, mockMonth);
    });

    it('should throw error when MASTER role without accountId', async () => {
      // Arrange
      const params: GetAdvertisementStatisticsByMonthDto = { month: mockMonth };
      const query: GetAllAdvertisementStatisticsDto = {};
      
      // Act & Assert
      await expect(controller.getByMonth(mockMasterAuthenticated, params, query))
        .rejects
        .toThrow('invalid.accountId.should.not.be.empty');
      expect(getAccountAdvertisementStatisticsUseCase.getByMonth).not.toHaveBeenCalled();
    });
  });

  describe('generates', () => {
    it('should call generate monthly statistics use case with month and accountId', async () => {
      // Arrange
      const dto: GenerateAdvertisementStatisticsDto = {
        month: mockMonth,
        accountId: mockAccountId
      };
      generateMonthlyStatisticsUseCase.execute.mockResolvedValue(undefined);
      
      // Act
      await controller.generates(dto);
      
      // Assert
      expect(generateMonthlyStatisticsUseCase.execute).toHaveBeenCalledWith({
        month: mockMonth,
        accountId: mockAccountId
      });
    });

    it('should call generate monthly statistics use case with only month', async () => {
      // Arrange
      const dto: GenerateAdvertisementStatisticsDto = {
        month: mockMonth
      };
      generateMonthlyStatisticsUseCase.execute.mockResolvedValue(undefined);
      
      // Act
      await controller.generates(dto);
      
      // Assert
      expect(generateMonthlyStatisticsUseCase.execute).toHaveBeenCalledWith({
        month: mockMonth,
        accountId: undefined
      });
    });

    it('should call generate monthly statistics use case with only accountId', async () => {
      // Arrange
      const dto: GenerateAdvertisementStatisticsDto = {
        accountId: mockAccountId
      };
      generateMonthlyStatisticsUseCase.execute.mockResolvedValue(undefined);
      
      // Act
      await controller.generates(dto);
      
      // Assert
      expect(generateMonthlyStatisticsUseCase.execute).toHaveBeenCalledWith({
        month: undefined,
        accountId: mockAccountId
      });
    });

    it('should call generate monthly statistics use case without parameters', async () => {
      // Arrange
      const dto: GenerateAdvertisementStatisticsDto = {};
      generateMonthlyStatisticsUseCase.execute.mockResolvedValue(undefined);
      
      // Act
      await controller.generates(dto);
      
      // Assert
      expect(generateMonthlyStatisticsUseCase.execute).toHaveBeenCalledWith({
        month: undefined,
        accountId: undefined
      });
    });
  });
});

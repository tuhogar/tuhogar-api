import { Test, TestingModule } from '@nestjs/testing';
import { CreateAdvertisementUseCase } from './create-advertisement.use-case';
import { ConfigService } from '@nestjs/config';
import { UpdateFirebaseUsersDataUseCase } from '../user/update-firebase-users-data.use-case';
import { IAdvertisementRepository } from 'src/application/interfaces/repositories/advertisement.repository.interface';
import { IAdvertisementCodeRepository } from 'src/application/interfaces/repositories/advertisement-code.repository.interface';
import { ISubscriptionRepository } from 'src/application/interfaces/repositories/subscription.repository.interface';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user';
import { UserRole, UserStatus } from 'src/domain/entities/user';
import { AccountStatus } from 'src/domain/entities/account';
import { SubscriptionStatus } from 'src/domain/entities/subscription';
import { CreateUpdateAdvertisementDto } from 'src/infraestructure/http/dtos/advertisement/create-update-advertisement.dto';
import { Advertisement, AdvertisementStatus, AdvertisementType, AdvertisementTransactionType } from 'src/domain/entities/advertisement';

describe('CreateAdvertisementUseCase', () => {
  let useCase: CreateAdvertisementUseCase;
  let configService: ConfigService;
  let updateFirebaseUsersDataUseCase: UpdateFirebaseUsersDataUseCase;
  let advertisementRepository: IAdvertisementRepository;
  let advertisementCodeRepository: IAdvertisementCodeRepository;
  let subscriptionRepository: ISubscriptionRepository;

  // Mocks
  const mockFirstSubscriptionPlanId = 'first-plan-id';
  const mockAccountId = 'account-123';
  const mockPlanId = 'plan-123';
  const mockSubscriptionId = 'subscription-123';
  const mockUserId = 'user-123';
  const mockUid = 'firebase-uid-123';
  const mockAdvertisementCode = { code: 'AD123' };
  const mockMaxAdvertisements = 5;

  // Mock para AuthenticatedUser
  const mockAuthenticatedUser: AuthenticatedUser = {
    userRole: UserRole.USER,
    uid: mockUid,
    userId: mockUserId,
    email: 'user@example.com',
    userStatus: UserStatus.ACTIVE,
    planId: mockPlanId,
    accountId: mockAccountId,
    accountStatus: AccountStatus.ACTIVE,
    subscriptionId: mockSubscriptionId,
    subscriptionStatus: SubscriptionStatus.ACTIVE,
    maxAdvertisements: mockMaxAdvertisements,
  };

  // Mock para CreateUpdateAdvertisementDto
  const mockCreateUpdateAdvertisementDto = {
    transactionType: AdvertisementTransactionType.SALE,
    type: AdvertisementType.APARTMENT,
    description: 'Test Description',
    price: 100000,
    address: {
      country: 'Test Country',
      state: 'Test State',
      city: 'Test City',
      neighbourhood: 'Test Neighborhood',
      street: 'Test Street',
      latitude: -23.5505,
      longitude: -46.6333,
      postalCode: '12345-678',
    },
  } as any as CreateUpdateAdvertisementDto;

  // Mock para Advertisement
  const mockAdvertisement: Advertisement = {
    id: 'advertisement-123',
    accountId: mockAccountId,
    createdUserId: mockUserId,
    updatedUserId: mockUserId,
    status: AdvertisementStatus.WAITING_FOR_APPROVAL,
    code: 12345, // Código numérico
    transactionType: AdvertisementTransactionType.SALE,
    type: AdvertisementType.APARTMENT,
    description: mockCreateUpdateAdvertisementDto.description,
    price: mockCreateUpdateAdvertisementDto.price,
    address: mockCreateUpdateAdvertisementDto.address as any,
  } as Advertisement;

  beforeEach(async () => {
    // Mocks para os serviços e repositórios
    configService = {
      get: jest.fn().mockReturnValue(mockFirstSubscriptionPlanId),
    } as any;

    updateFirebaseUsersDataUseCase = {
      execute: jest.fn().mockResolvedValue(undefined),
    } as any;

    advertisementRepository = {
      create: jest.fn().mockResolvedValue(mockAdvertisement),
      countActiveOrWaitingByAccountId: jest.fn().mockResolvedValue(0),
    } as any;

    advertisementCodeRepository = {
      generateNewCode: jest.fn().mockResolvedValue(mockAdvertisementCode),
    } as any;

    subscriptionRepository = {
      active: jest.fn().mockResolvedValue(undefined),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateAdvertisementUseCase,
        {
          provide: ConfigService,
          useValue: configService,
        },
        {
          provide: UpdateFirebaseUsersDataUseCase,
          useValue: updateFirebaseUsersDataUseCase,
        },
        {
          provide: IAdvertisementRepository,
          useValue: advertisementRepository,
        },
        {
          provide: IAdvertisementCodeRepository,
          useValue: advertisementCodeRepository,
        },
        {
          provide: ISubscriptionRepository,
          useValue: subscriptionRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateAdvertisementUseCase>(CreateAdvertisementUseCase);

    // Spy no console.error para evitar logs durante os testes
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create an advertisement when user has not reached the limit', async () => {
    // Arrange
    advertisementRepository.countActiveOrWaitingByAccountId = jest.fn().mockResolvedValue(3); // 3 anúncios existentes, limite é 5

    // Act
    const result = await useCase.execute(mockAuthenticatedUser, mockCreateUpdateAdvertisementDto);

    // Assert
    expect(advertisementRepository.countActiveOrWaitingByAccountId).toHaveBeenCalledWith(mockAccountId);
    expect(advertisementRepository.create).toHaveBeenCalledWith(expect.objectContaining({
      accountId: mockAccountId,
      createdUserId: mockUserId,
      updatedUserId: mockUserId,
      status: AdvertisementStatus.WAITING_FOR_APPROVAL,
      code: mockAdvertisementCode.code,
    }));
    expect(result).toEqual(mockAdvertisement);
  });

  it('should throw an error when user has reached the limit', async () => {
    // Arrange
    advertisementRepository.countActiveOrWaitingByAccountId = jest.fn().mockResolvedValue(5); // 5 anúncios existentes, limite é 5

    // Act & Assert
    await expect(useCase.execute(mockAuthenticatedUser, mockCreateUpdateAdvertisementDto))
      .rejects.toThrow('invalid.advertisement.limit.reached.for.plan');
    
    expect(advertisementRepository.countActiveOrWaitingByAccountId).toHaveBeenCalledWith(mockAccountId);
    expect(advertisementRepository.create).not.toHaveBeenCalled();
  });

  it('should throw an error when user has exceeded the limit', async () => {
    // Arrange
    advertisementRepository.countActiveOrWaitingByAccountId = jest.fn().mockResolvedValue(6); // 6 anúncios existentes, limite é 5

    // Act & Assert
    await expect(useCase.execute(mockAuthenticatedUser, mockCreateUpdateAdvertisementDto))
      .rejects.toThrow('invalid.advertisement.limit.reached.for.plan');
    
    expect(advertisementRepository.countActiveOrWaitingByAccountId).toHaveBeenCalledWith(mockAccountId);
    expect(advertisementRepository.create).not.toHaveBeenCalled();
  });

  it('should not check the limit when maxAdvertisements is undefined', async () => {
    // Arrange
    const userWithoutMaxAds = { ...mockAuthenticatedUser, maxAdvertisements: undefined };

    // Act
    const result = await useCase.execute(userWithoutMaxAds, mockCreateUpdateAdvertisementDto);

    // Assert
    expect(advertisementRepository.countActiveOrWaitingByAccountId).not.toHaveBeenCalled();
    expect(advertisementRepository.create).toHaveBeenCalled();
    expect(result).toEqual(mockAdvertisement);
  });

  it('should not check the limit when maxAdvertisements is null', async () => {
    // Arrange
    const userWithNullMaxAds = { ...mockAuthenticatedUser, maxAdvertisements: null };

    // Act
    const result = await useCase.execute(userWithNullMaxAds, mockCreateUpdateAdvertisementDto);

    // Assert
    expect(advertisementRepository.countActiveOrWaitingByAccountId).not.toHaveBeenCalled();
    expect(advertisementRepository.create).toHaveBeenCalled();
    expect(result).toEqual(mockAdvertisement);
  });

  it('should throw an error when user has no plan associated', async () => {
    // Arrange
    const userWithoutPlan = { ...mockAuthenticatedUser, planId: undefined };

    // Act & Assert
    await expect(useCase.execute(userWithoutPlan, mockCreateUpdateAdvertisementDto))
      .rejects.toThrow('invalid.user.has.no.plan.associated');
    
    expect(advertisementRepository.countActiveOrWaitingByAccountId).not.toHaveBeenCalled();
    expect(advertisementRepository.create).not.toHaveBeenCalled();
  });

  it('should allow creating an advertisement when maxAdvertisements is 0 and user has no advertisements', async () => {
    // Arrange
    const userWithZeroMaxAds = { ...mockAuthenticatedUser, maxAdvertisements: 0 };
    advertisementRepository.countActiveOrWaitingByAccountId = jest.fn().mockResolvedValue(0);

    // Act
    const result = await useCase.execute(userWithZeroMaxAds, mockCreateUpdateAdvertisementDto);

    // Assert
    expect(advertisementRepository.countActiveOrWaitingByAccountId).toHaveBeenCalledWith(mockAccountId);
    expect(advertisementRepository.create).toHaveBeenCalled();
    expect(result).toEqual(mockAdvertisement);
  });

  it('should throw an error when maxAdvertisements is 0 and user has advertisements', async () => {
    // Arrange
    const userWithZeroMaxAds = { ...mockAuthenticatedUser, maxAdvertisements: 0 };
    advertisementRepository.countActiveOrWaitingByAccountId = jest.fn().mockResolvedValue(1);

    // Act & Assert
    await expect(useCase.execute(userWithZeroMaxAds, mockCreateUpdateAdvertisementDto))
      .rejects.toThrow('invalid.advertisement.limit.reached.for.plan');
    
    expect(advertisementRepository.countActiveOrWaitingByAccountId).toHaveBeenCalledWith(mockAccountId);
    expect(advertisementRepository.create).not.toHaveBeenCalled();
  });
});

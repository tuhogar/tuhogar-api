import { Test, TestingModule } from '@nestjs/testing';
import { AdjustAdvertisementsAfterPlanChangeUseCase } from './adjust-advertisements-after-plan-change.use-case';
import { IAdvertisementRepository } from 'src/application/interfaces/repositories/advertisement.repository.interface';
import { IPlanRepository } from 'src/application/interfaces/repositories/plan.repository.interface';
import { Advertisement, AdvertisementStatus } from 'src/domain/entities/advertisement';
import { Plan } from 'src/domain/entities/plan';
import { Logger } from '@nestjs/common';

describe('AdjustAdvertisementsAfterPlanChangeUseCase', () => {
  let useCase: AdjustAdvertisementsAfterPlanChangeUseCase;
  let advertisementRepository: jest.Mocked<IAdvertisementRepository>;
  let planRepository: jest.Mocked<IPlanRepository>;
  let loggerSpy: jest.SpyInstance;

  // Mocks
  const mockAccountId = 'account-123';
  const mockPlanId = 'plan-123';
  
  // Mock para Plan
  const mockPlan: Plan = {
    id: mockPlanId,
    name: 'Test Plan',
    maxAdvertisements: 3,
    maxPhotos: 5,
    price: 100,
    freeTrialDays: 30, // duração em dias do período gratuito
    items: ['Anúncios limitados', 'Fotos limitadas'],
    externalId: 'ext-plan-123'
  };

  // Mock para Advertisement com excesso de fotos
  const createMockAdvertisementWithExcessPhotos = (id: string): Advertisement => ({
    id,
    accountId: mockAccountId,
    status: AdvertisementStatus.ACTIVE,
    photos: Array(10).fill({ url: 'https://example.com/photo.jpg' }),
    updatedAt: new Date()
  } as Advertisement);

  // Mock para Advertisement sem excesso de fotos
  const createMockAdvertisement = (id: string, status = AdvertisementStatus.ACTIVE): Advertisement => ({
    id,
    accountId: mockAccountId,
    status,
    photos: Array(3).fill({ url: 'https://example.com/photo.jpg' }),
    updatedAt: new Date()
  } as Advertisement);

  beforeEach(async () => {
    // Mocks para os repositórios
    advertisementRepository = {
      findActiveOrWaitingWithExcessPhotos: jest.fn(),
      findActiveOrWaitingByAccountIdWithOrder: jest.fn(),
      updateStatus: jest.fn(),
      countActiveOrWaitingByAccountId: jest.fn(),
    } as any;

    planRepository = {
      findOneById: jest.fn(),
    } as any;

    // Mock para o Logger
    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdjustAdvertisementsAfterPlanChangeUseCase,
        {
          provide: IAdvertisementRepository,
          useValue: advertisementRepository,
        },
        {
          provide: IPlanRepository,
          useValue: planRepository,
        },
      ],
    }).compile();

    useCase = module.get<AdjustAdvertisementsAfterPlanChangeUseCase>(AdjustAdvertisementsAfterPlanChangeUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should pause advertisements with excess photos', async () => {
    // Arrange
    planRepository.findOneById.mockResolvedValue(mockPlan);
    
    const adsWithExcessPhotos = [
      createMockAdvertisementWithExcessPhotos('ad-1'),
      createMockAdvertisementWithExcessPhotos('ad-2')
    ];
    
    advertisementRepository.findActiveOrWaitingWithExcessPhotos.mockResolvedValue(adsWithExcessPhotos);
    advertisementRepository.findActiveOrWaitingByAccountIdWithOrder.mockResolvedValue([]);
    advertisementRepository.countActiveOrWaitingByAccountId.mockResolvedValue(2);
    advertisementRepository.updateStatus.mockResolvedValue(undefined);

    // Act
    const result = await useCase.execute({ accountId: mockAccountId, planId: mockPlanId });

    // Assert
    expect(planRepository.findOneById).toHaveBeenCalledWith(mockPlanId);
    expect(advertisementRepository.findActiveOrWaitingWithExcessPhotos).toHaveBeenCalledWith(mockAccountId, mockPlan.maxPhotos);
    expect(advertisementRepository.updateStatus).toHaveBeenCalledWith(
      ['ad-1', 'ad-2'],
      mockAccountId,
      AdvertisementStatus.PAUSED_BY_APPLICATION,
      null,
      null
    );
    expect(result).toEqual({
      pausedDueToPhotoLimit: 2,
      pausedDueToAdvertisementLimit: 0,
      totalActiveAdvertisements: 2
    });
  });

  it('should pause advertisements when exceeding the maximum allowed', async () => {
    // Arrange
    planRepository.findOneById.mockResolvedValue(mockPlan);
    
    // No ads with excess photos
    advertisementRepository.findActiveOrWaitingWithExcessPhotos.mockResolvedValue([]);
    
    // 5 active ads, but plan allows only 3
    const activeAds = [
      createMockAdvertisement('ad-1'),
      createMockAdvertisement('ad-2'),
      createMockAdvertisement('ad-3'),
      createMockAdvertisement('ad-4'),
      createMockAdvertisement('ad-5')
    ];
    
    advertisementRepository.findActiveOrWaitingByAccountIdWithOrder.mockResolvedValue(activeAds);
    advertisementRepository.countActiveOrWaitingByAccountId.mockResolvedValue(3); // After pausing 2
    advertisementRepository.updateStatus.mockResolvedValue(undefined);

    // Act
    const result = await useCase.execute({ accountId: mockAccountId, planId: mockPlanId });

    // Assert
    expect(planRepository.findOneById).toHaveBeenCalledWith(mockPlanId);
    expect(advertisementRepository.findActiveOrWaitingByAccountIdWithOrder).toHaveBeenCalledWith(
      mockAccountId,
      'updatedAt',
      'desc'
    );
    expect(advertisementRepository.updateStatus).toHaveBeenCalledWith(
      ['ad-1', 'ad-2'], // The first 2 ads (most recent) should be paused
      mockAccountId,
      AdvertisementStatus.PAUSED_BY_APPLICATION,
      null,
      null
    );
    expect(result).toEqual({
      pausedDueToPhotoLimit: 0,
      pausedDueToAdvertisementLimit: 2,
      totalActiveAdvertisements: 3
    });
  });

  it('should handle both photo limit and advertisement limit', async () => {
    // Arrange
    planRepository.findOneById.mockResolvedValue(mockPlan);
    
    // 2 ads with excess photos
    const adsWithExcessPhotos = [
      createMockAdvertisementWithExcessPhotos('ad-1'),
      createMockAdvertisementWithExcessPhotos('ad-2')
    ];
    
    advertisementRepository.findActiveOrWaitingWithExcessPhotos.mockResolvedValue(adsWithExcessPhotos);
    
    // 5 active ads (including the 2 with excess photos), but plan allows only 3
    const activeAds = [
      createMockAdvertisement('ad-3'),
      createMockAdvertisement('ad-4'),
      createMockAdvertisement('ad-5'),
      createMockAdvertisement('ad-6'),
      createMockAdvertisement('ad-7')
    ];
    
    advertisementRepository.findActiveOrWaitingByAccountIdWithOrder.mockResolvedValue(activeAds);
    advertisementRepository.countActiveOrWaitingByAccountId.mockResolvedValue(3); // After pausing 4 (2 for photos, 2 for limit)
    
    // Mock updateStatus to be called twice
    advertisementRepository.updateStatus.mockResolvedValue(undefined);

    // Act
    const result = await useCase.execute({ accountId: mockAccountId, planId: mockPlanId });

    // Assert
    expect(planRepository.findOneById).toHaveBeenCalledWith(mockPlanId);
    expect(advertisementRepository.findActiveOrWaitingWithExcessPhotos).toHaveBeenCalledWith(mockAccountId, mockPlan.maxPhotos);
    expect(advertisementRepository.findActiveOrWaitingByAccountIdWithOrder).toHaveBeenCalledWith(
      mockAccountId,
      'updatedAt',
      'desc'
    );
    
    // First call to updateStatus for excess photos
    expect(advertisementRepository.updateStatus).toHaveBeenCalledWith(
      ['ad-1', 'ad-2'],
      mockAccountId,
      AdvertisementStatus.PAUSED_BY_APPLICATION,
      null,
      null
    );
    
    // Second call to updateStatus for excess ads
    expect(advertisementRepository.updateStatus).toHaveBeenCalledWith(
      ['ad-3', 'ad-4'],
      mockAccountId,
      AdvertisementStatus.PAUSED_BY_APPLICATION,
      null,
      null
    );
    
    expect(result).toEqual({
      pausedDueToPhotoLimit: 2,
      pausedDueToAdvertisementLimit: 2,
      totalActiveAdvertisements: 3
    });
  });

  it('should not pause any advertisements when within limits', async () => {
    // Arrange
    planRepository.findOneById.mockResolvedValue(mockPlan);
    
    // No ads with excess photos
    advertisementRepository.findActiveOrWaitingWithExcessPhotos.mockResolvedValue([]);
    
    // 3 active ads, which is exactly the plan limit
    const activeAds = [
      createMockAdvertisement('ad-1'),
      createMockAdvertisement('ad-2'),
      createMockAdvertisement('ad-3')
    ];
    
    advertisementRepository.findActiveOrWaitingByAccountIdWithOrder.mockResolvedValue(activeAds);
    advertisementRepository.countActiveOrWaitingByAccountId.mockResolvedValue(3);

    // Act
    const result = await useCase.execute({ accountId: mockAccountId, planId: mockPlanId });

    // Assert
    expect(planRepository.findOneById).toHaveBeenCalledWith(mockPlanId);
    expect(advertisementRepository.findActiveOrWaitingWithExcessPhotos).toHaveBeenCalledWith(mockAccountId, mockPlan.maxPhotos);
    expect(advertisementRepository.findActiveOrWaitingByAccountIdWithOrder).toHaveBeenCalledWith(
      mockAccountId,
      'updatedAt',
      'desc'
    );
    expect(advertisementRepository.updateStatus).not.toHaveBeenCalled();
    expect(result).toEqual({
      pausedDueToPhotoLimit: 0,
      pausedDueToAdvertisementLimit: 0,
      totalActiveAdvertisements: 3
    });
  });

  it('should throw an error when plan is not found', async () => {
    // Arrange
    planRepository.findOneById.mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute({ accountId: mockAccountId, planId: mockPlanId }))
      .rejects.toThrow('notfound.plan.not.found');
    
    expect(planRepository.findOneById).toHaveBeenCalledWith(mockPlanId);
    expect(advertisementRepository.findActiveOrWaitingWithExcessPhotos).not.toHaveBeenCalled();
    expect(advertisementRepository.findActiveOrWaitingByAccountIdWithOrder).not.toHaveBeenCalled();
    expect(advertisementRepository.updateStatus).not.toHaveBeenCalled();
  });

  it('should throw an error when plan is missing required properties', async () => {
    // Arrange
    const invalidPlan = { ...mockPlan, maxPhotos: undefined };
    planRepository.findOneById.mockResolvedValue(invalidPlan);

    // Act & Assert
    await expect(useCase.execute({ accountId: mockAccountId, planId: mockPlanId }))
      .rejects.toThrow('invalid.plan.missing.required.properties');
    
    expect(planRepository.findOneById).toHaveBeenCalledWith(mockPlanId);
    expect(advertisementRepository.findActiveOrWaitingWithExcessPhotos).not.toHaveBeenCalled();
    expect(advertisementRepository.findActiveOrWaitingByAccountIdWithOrder).not.toHaveBeenCalled();
    expect(advertisementRepository.updateStatus).not.toHaveBeenCalled();
  });

  it('should not limit advertisements when plan has maxAdvertisements set to 0', async () => {
    // Arrange
    const planWithNoLimit = { ...mockPlan, maxAdvertisements: 0 };
    planRepository.findOneById.mockResolvedValue(planWithNoLimit);
    
    // No ads with excess photos
    advertisementRepository.findActiveOrWaitingWithExcessPhotos.mockResolvedValue([]);
    
    // 5 active ads
    const activeAds = [
      createMockAdvertisement('ad-1'),
      createMockAdvertisement('ad-2'),
      createMockAdvertisement('ad-3'),
      createMockAdvertisement('ad-4'),
      createMockAdvertisement('ad-5')
    ];
    
    advertisementRepository.countActiveOrWaitingByAccountId.mockResolvedValue(5);

    // Act
    const result = await useCase.execute({ accountId: mockAccountId, planId: mockPlanId });

    // Assert
    expect(planRepository.findOneById).toHaveBeenCalledWith(mockPlanId);
    expect(advertisementRepository.findActiveOrWaitingWithExcessPhotos).toHaveBeenCalledWith(mockAccountId, planWithNoLimit.maxPhotos);
    expect(advertisementRepository.findActiveOrWaitingByAccountIdWithOrder).not.toHaveBeenCalled();
    expect(advertisementRepository.updateStatus).not.toHaveBeenCalled();
    expect(result).toEqual({
      pausedDueToPhotoLimit: 0,
      pausedDueToAdvertisementLimit: 0,
      totalActiveAdvertisements: 5
    });
  });
});

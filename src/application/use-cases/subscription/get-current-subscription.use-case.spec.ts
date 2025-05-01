import { Test, TestingModule } from '@nestjs/testing';
import { GetCurrentSubscriptionUseCase } from './get-current-subscription.use-case';
import { ISubscriptionRepository } from 'src/application/interfaces/repositories/subscription.repository.interface';
import { IPlanRepository } from 'src/application/interfaces/repositories/plan.repository.interface';
import { Subscription } from 'src/domain/entities/subscription';
import { SubscriptionWithRemainingFreeDays } from 'src/domain/entities/subscription-with-remaining-free-days';
import { Plan } from 'src/domain/entities/plan';

describe('GetCurrentSubscriptionUseCase', () => {
  let useCase: GetCurrentSubscriptionUseCase;
  let subscriptionRepository: ISubscriptionRepository;
  let planRepository: IPlanRepository;

  // Valores para testes
  const DAYS_SINCE_CREATION_FOR_ACTIVE = 10; // Assinatura criada há 10 dias
  const DAYS_SINCE_CREATION_FOR_EXPIRED = 40; // Assinatura criada há 40 dias (período gratuito expirado)
  
  // Mock para a assinatura (criada 10 dias antes da data fixa)
  const mockSubscription: Subscription = {
    id: 'subscription-id',
    accountId: 'account-id',
    planId: 'plan-id',
    status: 'ACTIVE',
    externalId: 'external-id',
    externalPayerReference: 'external-payer-reference',
    createdAt: new Date('2025-04-20T00:00:00Z'), // 10 dias antes da data fixa
    updatedAt: new Date('2025-04-20T00:00:00Z'),
    paymentDate: new Date('2025-04-20T00:00:00Z'),
  } as Subscription;
  
  // Mock para o plano com 30 dias de período gratuito
  const mockPlan: Plan = {
    id: 'plan-id',
    name: 'Plano Premium',
    freeTrialDays: 30, // 30 dias de período gratuito
    items: ['Item 1', 'Item 2'],
    price: 99.99,
    externalId: 'external-plan-id',
    maxAdvertisements: 10,
    maxPhotos: 20
  } as Plan;
  
  // Mock para o plano sem período gratuito
  const mockPlanWithoutFreeTrial: Plan = {
    id: 'plan-without-free-trial-id',
    name: 'Plano Básico',
    freeTrialDays: 0, // Sem período gratuito
    items: ['Item 1'],
    price: 49.99,
    externalId: 'external-basic-plan-id',
    maxAdvertisements: 5,
    maxPhotos: 10
  } as Plan;

  beforeEach(async () => {
    // Resetar todos os mocks antes de cada teste
    jest.restoreAllMocks();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCurrentSubscriptionUseCase,
        {
          provide: ISubscriptionRepository,
          useValue: {
            findMostRecentByAccountId: jest.fn(),
          },
        },
        {
          provide: IPlanRepository,
          useValue: {
            findOneById: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetCurrentSubscriptionUseCase>(GetCurrentSubscriptionUseCase);
    subscriptionRepository = module.get<ISubscriptionRepository>(ISubscriptionRepository);
    planRepository = module.get<IPlanRepository>(IPlanRepository);
  });
  
  afterEach(() => {
    // Limpar todos os mocks após cada teste
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return the subscription with remaining free days calculated', async () => {
      // Arrange
      const accountId = 'account-id';
      jest.spyOn(subscriptionRepository, 'findMostRecentByAccountId').mockResolvedValue(mockSubscription);
      jest.spyOn(planRepository, 'findOneById').mockResolvedValue(mockPlan);
      
      // Mock do método de cálculo de dias para retornar 10 dias
      jest.spyOn(useCase as any, 'calculateDaysBetween').mockReturnValue(DAYS_SINCE_CREATION_FOR_ACTIVE);

      // Act
      const result = await useCase.execute({ accountId }) as SubscriptionWithRemainingFreeDays;

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toEqual(mockSubscription.id);
      expect(result.remainingFreeDays).toBeDefined();
      // Assinatura criada 10 dias atrás, plano com 30 dias gratuitos, restam 20 dias
      expect(result.remainingFreeDays).toEqual(20);
      expect(subscriptionRepository.findMostRecentByAccountId).toHaveBeenCalledWith(accountId);
      expect(planRepository.findOneById).toHaveBeenCalledWith(mockSubscription.planId);
    });

    it('should return 0 remaining free days when the free trial period has expired', async () => {
      // Arrange
      const accountId = 'account-id';
      jest.spyOn(subscriptionRepository, 'findMostRecentByAccountId').mockResolvedValue(mockSubscription);
      jest.spyOn(planRepository, 'findOneById').mockResolvedValue(mockPlan);
      
      // Mock do método de cálculo de dias para retornar 40 dias (período gratuito expirado)
      jest.spyOn(useCase as any, 'calculateDaysBetween').mockReturnValue(DAYS_SINCE_CREATION_FOR_EXPIRED);

      // Act
      const result = await useCase.execute({ accountId }) as SubscriptionWithRemainingFreeDays;

      // Assert
      expect(result).toBeDefined();
      expect(result.remainingFreeDays).toEqual(0); // Período gratuito já expirou
    });

    it('should return 0 remaining free days when the plan has no free trial period', async () => {
      // Arrange
      const accountId = 'account-id';
      jest.spyOn(subscriptionRepository, 'findMostRecentByAccountId').mockResolvedValue(mockSubscription);
      jest.spyOn(planRepository, 'findOneById').mockResolvedValue(mockPlanWithoutFreeTrial);
      
      // Não precisamos mockar o cálculo de dias aqui, pois o plano não tem período gratuito

      // Act
      const result = await useCase.execute({ accountId }) as SubscriptionWithRemainingFreeDays;

      // Assert
      expect(result).toBeDefined();
      expect(result.remainingFreeDays).toEqual(0); // Plano sem período gratuito
    });

    it('should return 0 remaining free days when the plan is not found', async () => {
      // Arrange
      const accountId = 'account-id';
      jest.spyOn(subscriptionRepository, 'findMostRecentByAccountId').mockResolvedValue(mockSubscription);
      jest.spyOn(planRepository, 'findOneById').mockResolvedValue(null);
      
      // Não precisamos mockar o cálculo de dias aqui, pois o plano não é encontrado

      // Act
      const result = await useCase.execute({ accountId }) as SubscriptionWithRemainingFreeDays;

      // Assert
      expect(result).toBeDefined();
      expect(result.remainingFreeDays).toEqual(0); // Plano não encontrado
    });

    it('should throw an error when no subscription is found', async () => {
      // Arrange
      const accountId = 'account-id';
      jest.spyOn(subscriptionRepository, 'findMostRecentByAccountId').mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute({ accountId }))
        .rejects
        .toThrow('notfound.subscription.do.not.exists');
      
      expect(subscriptionRepository.findMostRecentByAccountId).toHaveBeenCalledWith(accountId);
      expect(planRepository.findOneById).not.toHaveBeenCalled();
    });
  });
});

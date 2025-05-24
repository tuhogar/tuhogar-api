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
    plan: mockPlan
  } as Subscription;
  
  // Mock para a assinatura com plano populado
  const mockSubscriptionWithPlan: Subscription = {
    ...mockSubscription,
    plan: mockPlan
  } as Subscription;
  
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
    it('should return the subscription with remaining free days calculated and plan included', async () => {
      // Arrange
      const accountId = 'account-id';
      jest.spyOn(subscriptionRepository, 'findMostRecentByAccountId').mockResolvedValue(mockSubscription);
      
      // Mock do método de cálculo de dias para retornar 10 dias
      jest.spyOn(useCase as any, 'calculateDaysBetween').mockReturnValue(DAYS_SINCE_CREATION_FOR_ACTIVE);

      // Act
      const result = await useCase.execute({ accountId }) as SubscriptionWithRemainingFreeDays;

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toEqual(mockSubscription.id);
      expect(result.remainingFreeDays).toEqual(20); // 30 - 10 = 20 dias restantes
      
      // Verificar que o plano está presente na assinatura
      expect(result.plan).toBeDefined();
      expect(result.plan).toEqual(mockPlan);
      
      expect(subscriptionRepository.findMostRecentByAccountId).toHaveBeenCalledWith(accountId);
    });

    it('should return 0 remaining free days when the free trial period has expired', async () => {
      // Arrange
      const accountId = 'account-id';
      jest.spyOn(subscriptionRepository, 'findMostRecentByAccountId').mockResolvedValue(mockSubscription);
      
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
      
      // Criar uma assinatura com plano sem período gratuito já populado
      const planWithoutFreeTrial = new Plan({
        id: 'plan-id',
        name: 'Plano Básico',
        freeTrialDays: 0, // Sem período gratuito
        items: ['Item 1'],
        price: 49.99,
        externalId: 'external-basic-plan-id',
        maxAdvertisements: 5,
        maxPhotos: 10
      });
      
      const subscriptionWithPlanWithoutFreeTrial: Subscription = {
        ...mockSubscription,
        plan: planWithoutFreeTrial
      };
      
      jest.spyOn(subscriptionRepository, 'findMostRecentByAccountId').mockResolvedValue(subscriptionWithPlanWithoutFreeTrial);
      jest.spyOn(planRepository, 'findOneById'); // Spy, mas não deve ser chamado
      
      // Precisamos mockar o cálculo de dias mesmo que o plano não tenha período gratuito
      jest.spyOn(useCase as any, 'calculateDaysBetween').mockReturnValue(DAYS_SINCE_CREATION_FOR_ACTIVE);

      // Act
      const result = await useCase.execute({ accountId }) as SubscriptionWithRemainingFreeDays;

      // Assert
      expect(result).toBeDefined();
      expect(result.remainingFreeDays).toEqual(0); // Plano sem período gratuito
      expect(planRepository.findOneById).not.toHaveBeenCalled(); // Não deve buscar o plano, pois já está populado
    });

    it('should return 0 remaining free days when the plan has null freeTrialDays', async () => {
      // Arrange
      const accountId = 'account-id';
      // Criar uma assinatura com plano sem freeTrialDays
      const planWithNullFreeTrial = new Plan({
        id: 'plan-id',
        name: 'Plano Básico',
        freeTrialDays: null, // freeTrialDays nulo
        items: ['Item 1'],
        price: 49.99,
        externalId: 'external-basic-plan-id',
        maxAdvertisements: 5,
        maxPhotos: 10
      });
      
      const subscriptionWithNullFreeTrialPlan: Subscription = {
        ...mockSubscription,
        plan: planWithNullFreeTrial
      };
      
      jest.spyOn(subscriptionRepository, 'findMostRecentByAccountId').mockResolvedValue(subscriptionWithNullFreeTrialPlan);
      
      // Precisamos mockar o cálculo de dias mesmo que o plano não tenha período gratuito
      jest.spyOn(useCase as any, 'calculateDaysBetween').mockReturnValue(DAYS_SINCE_CREATION_FOR_ACTIVE);

      // Act
      const result = await useCase.execute({ accountId }) as SubscriptionWithRemainingFreeDays;

      // Assert
      expect(result).toBeDefined();
      expect(result.remainingFreeDays).toEqual(0); // Plano com freeTrialDays nulo
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

import { Test } from '@nestjs/testing';
import { GetSubscriptionPaymentHistoryUseCase } from './get-subscription-payment-history.use-case';
import { ISubscriptionPaymentRepository } from 'src/application/interfaces/repositories/subscription-payment.repository.interface';
import { ISubscriptionRepository } from 'src/application/interfaces/repositories/subscription.repository.interface';
import { IPlanRepository } from 'src/application/interfaces/repositories/plan.repository.interface';
import { SubscriptionPaymentStatus } from 'src/domain/entities/subscription-payment';
import { SubscriptionStatus } from 'src/domain/entities/subscription';
import { SubscriptionPaymentWithSubscription } from 'src/domain/entities/subscription-payment-with-subscription';

describe('GetSubscriptionPaymentHistoryUseCase', () => {
  let getSubscriptionPaymentHistoryUseCase: GetSubscriptionPaymentHistoryUseCase;
  let subscriptionPaymentRepository: jest.Mocked<ISubscriptionPaymentRepository>;
  let subscriptionRepository: jest.Mocked<ISubscriptionRepository>;
  let planRepository: jest.Mocked<IPlanRepository>;

  const mockPayments = [
    {
      id: '123',
      accountId: 'account123',
      subscriptionId: 'subscription123',
      externalId: 'ext123',
      type: 'subscription',
      method: 'VS',
      description: 'Monthly payment',
      amount: 10000,
      currency: 'COP',
      status: SubscriptionPaymentStatus.APPROVED,
      paymentDate: new Date('2023-01-01')
    },
    {
      id: '456',
      accountId: 'account123',
      subscriptionId: 'subscription456',
      externalId: 'ext456',
      type: 'subscription',
      method: 'MC',
      description: 'Monthly payment',
      amount: 15000,
      currency: 'COP',
      status: SubscriptionPaymentStatus.APPROVED,
      paymentDate: new Date('2023-02-01')
    }
  ];

  const mockSubscription = {
    id: 'subscription123',
    accountId: 'account123',
    planId: 'plan123',
    status: SubscriptionStatus.ACTIVE,
    nextPaymentDate: new Date('2023-02-01')
  };

  const mockPlan = {
    id: 'plan123',
    name: 'Elite',
    price: 29990,
    items: ['item1', 'item2'],
    freeTrialDays: 7,
    photo: 'photo.jpg',
    externalId: 'ext-plan-123'
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        GetSubscriptionPaymentHistoryUseCase,
        {
          provide: ISubscriptionPaymentRepository,
          useValue: {
            findAllByAccountIdPaginated: jest.fn()
          }
        },
        {
          provide: ISubscriptionRepository,
          useValue: {
            findOneById: jest.fn()
          }
        },
        {
          provide: IPlanRepository,
          useValue: {
            findOneById: jest.fn()
          }
        }
      ]
    }).compile();

    getSubscriptionPaymentHistoryUseCase = moduleRef.get<GetSubscriptionPaymentHistoryUseCase>(GetSubscriptionPaymentHistoryUseCase);
    subscriptionPaymentRepository = moduleRef.get(ISubscriptionPaymentRepository) as jest.Mocked<ISubscriptionPaymentRepository>;
    subscriptionRepository = moduleRef.get(ISubscriptionRepository) as jest.Mocked<ISubscriptionRepository>;
    planRepository = moduleRef.get(IPlanRepository) as jest.Mocked<IPlanRepository>;
  });

  it('should be defined', () => {
    expect(getSubscriptionPaymentHistoryUseCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return paginated subscription payments with subscription and plan details', async () => {
      // Arrange
      const accountId = 'account123';
      const page = 1;
      const limit = 10;
      
      subscriptionPaymentRepository.findAllByAccountIdPaginated.mockResolvedValue({
        data: mockPayments,
        count: 2
      });
      
      subscriptionRepository.findOneById.mockResolvedValue(mockSubscription);
      planRepository.findOneById.mockResolvedValue(mockPlan);

      // Act
      const result = await getSubscriptionPaymentHistoryUseCase.execute({ accountId, page, limit });

      // Assert
      expect(result).toBeDefined();
      expect(result.data).toHaveLength(2);
      expect(result.count).toBe(2);
      
      // Check if the payments have subscription and plan data
      const paymentWithSubscription = result.data[0] as SubscriptionPaymentWithSubscription;
      expect(paymentWithSubscription.subscription).toBeDefined();
      expect(paymentWithSubscription.subscription.id).toBe('subscription123');
      expect(paymentWithSubscription.subscription.plan).toBeDefined();
      expect(paymentWithSubscription.subscription.plan.id).toBe('plan123');
      expect(paymentWithSubscription.subscription.plan.name).toBe('Elite');
      
      // Verify repository calls
      expect(subscriptionPaymentRepository.findAllByAccountIdPaginated).toHaveBeenCalledWith(accountId, page, limit);
      expect(subscriptionRepository.findOneById).toHaveBeenCalledWith('subscription123');
      expect(subscriptionRepository.findOneById).toHaveBeenCalledWith('subscription456');
      expect(planRepository.findOneById).toHaveBeenCalledWith('plan123');
    });

    it('should throw error when no payments are found', async () => {
      // Arrange
      const accountId = 'account123';
      const page = 1;
      const limit = 10;
      
      subscriptionPaymentRepository.findAllByAccountIdPaginated.mockResolvedValue({
        data: [],
        count: 0
      });

      // Act & Assert
      await expect(getSubscriptionPaymentHistoryUseCase.execute({ accountId, page, limit }))
        .rejects
        .toThrow('notfound.subscription.payment.history.do.not.exists');
      
      // Verify repository calls
      expect(subscriptionPaymentRepository.findAllByAccountIdPaginated).toHaveBeenCalledWith(accountId, page, limit);
      expect(subscriptionRepository.findOneById).not.toHaveBeenCalled();
      expect(planRepository.findOneById).not.toHaveBeenCalled();
    });

    it('should handle subscription not found case', async () => {
      // Arrange
      const accountId = 'account123';
      const page = 1;
      const limit = 10;
      
      subscriptionPaymentRepository.findAllByAccountIdPaginated.mockResolvedValue({
        data: mockPayments,
        count: 2
      });
      
      subscriptionRepository.findOneById.mockResolvedValue(null);
      planRepository.findOneById.mockResolvedValue(mockPlan);

      // Act
      const result = await getSubscriptionPaymentHistoryUseCase.execute({ accountId, page, limit });

      // Assert
      expect(result).toBeDefined();
      expect(result.data).toHaveLength(2);
      
      // Check that subscription is undefined when not found
      const paymentWithSubscription = result.data[0] as SubscriptionPaymentWithSubscription;
      expect(paymentWithSubscription.subscription).toBeUndefined();
      
      // Verify repository calls
      expect(subscriptionPaymentRepository.findAllByAccountIdPaginated).toHaveBeenCalledWith(accountId, page, limit);
      expect(subscriptionRepository.findOneById).toHaveBeenCalledWith('subscription123');
      expect(planRepository.findOneById).not.toHaveBeenCalled();
    });

    it('should handle plan not found case', async () => {
      // Arrange
      const accountId = 'account123';
      const page = 1;
      const limit = 10;
      
      // Criar uma cópia do mockSubscription sem o plano
      const subscriptionWithoutPlan = { ...mockSubscription };
      
      subscriptionPaymentRepository.findAllByAccountIdPaginated.mockResolvedValue({
        data: mockPayments,
        count: 2
      });
      
      // Configurar o mock para retornar a assinatura sem plano
      subscriptionRepository.findOneById.mockResolvedValue(subscriptionWithoutPlan);
      
      // Configurar o mock do planRepository para retornar null
      planRepository.findOneById.mockResolvedValue(null);
      
      // Act
      const result = await getSubscriptionPaymentHistoryUseCase.execute({ accountId, page, limit });

      // Assert
      expect(result).toBeDefined();
      expect(result.data).toHaveLength(2);
      
      // Verificar que a assinatura existe mas não tem plano definido
      const paymentWithSubscription = result.data[0] as SubscriptionPaymentWithSubscription;
      expect(paymentWithSubscription.subscription).toBeDefined();
      
      // Verificar que o planRepository foi chamado com o ID correto
      expect(subscriptionPaymentRepository.findAllByAccountIdPaginated).toHaveBeenCalledWith(accountId, page, limit);
      expect(subscriptionRepository.findOneById).toHaveBeenCalledWith('subscription123');
      expect(planRepository.findOneById).toHaveBeenCalledWith('plan123');
    });
  });
});

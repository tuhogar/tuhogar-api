import { Test, TestingModule } from '@nestjs/testing';
import { GetSubscriptionHistoryUseCase } from './get-subscription-history.use-case';
import { ISubscriptionRepository } from 'src/application/interfaces/repositories/subscription.repository.interface';
import { ISubscriptionPaymentRepository } from 'src/application/interfaces/repositories/subscription-payment.repository.interface';
import { Subscription } from 'src/domain/entities/subscription';
import { SubscriptionPayment } from 'src/domain/entities/subscription-payment';
import { SubscriptionWithPayments } from 'src/domain/entities/subscription-with-payments';
import { Plan } from 'src/domain/entities/plan';

describe('GetSubscriptionHistoryUseCase', () => {
  let useCase: GetSubscriptionHistoryUseCase;
  let subscriptionRepository: ISubscriptionRepository;
  let subscriptionPaymentRepository: ISubscriptionPaymentRepository;

  // Mock para o plano
  const mockPlan: Plan = {
    id: 'plan-id',
    name: 'Plano Premium',
    freeTrialDays: 30,
    items: ['Item 1', 'Item 2'],
    price: 99.99,
    externalId: 'external-plan-id',
    maxAdvertisements: 10,
    maxPhotos: 20
  } as Plan;

  // Mock para as assinaturas
  const mockSubscriptions: Subscription[] = [
    {
      id: 'subscription-id-1',
      accountId: 'account-id',
      planId: 'plan-id',
      status: 'ACTIVE',
      externalId: 'external-id-1',
      externalPayerReference: 'external-payer-reference-1',
      createdAt: new Date('2025-04-20T00:00:00Z'),
      updatedAt: new Date('2025-04-20T00:00:00Z'),
      paymentDate: new Date('2025-04-20T00:00:00Z'),
      plan: mockPlan
    } as Subscription,
    {
      id: 'subscription-id-2',
      accountId: 'account-id',
      planId: 'plan-id',
      status: 'CANCELLED',
      externalId: 'external-id-2',
      externalPayerReference: 'external-payer-reference-2',
      createdAt: new Date('2025-03-15T00:00:00Z'),
      updatedAt: new Date('2025-04-10T00:00:00Z'),
      paymentDate: new Date('2025-03-15T00:00:00Z'),
      plan: mockPlan
    } as Subscription
  ];

  // Mock para os pagamentos da primeira assinatura
  const mockPaymentsForSubscription1: SubscriptionPayment[] = [
    {
      id: 'payment-id-1',
      subscriptionId: 'subscription-id-1',
      accountId: 'account-id',
      externalId: 'external-payment-id-1',
      type: 'subscription',
      method: 'credit_card',
      description: 'Pagamento mensal - Plano Premium',
      amount: 99.99,
      currency: 'COP',
      status: 'APPROVED',
      paymentDate: new Date('2025-04-20T00:00:00Z')
    } as SubscriptionPayment,
    {
      id: 'payment-id-2',
      subscriptionId: 'subscription-id-1',
      accountId: 'account-id',
      externalId: 'external-payment-id-2',
      type: 'subscription',
      method: 'credit_card',
      description: 'Pagamento mensal - Plano Premium',
      amount: 99.99,
      currency: 'COP',
      status: 'APPROVED',
      paymentDate: new Date('2025-05-20T00:00:00Z')
    } as SubscriptionPayment
  ];

  // Mock para os pagamentos da segunda assinatura
  const mockPaymentsForSubscription2: SubscriptionPayment[] = [
    {
      id: 'payment-id-3',
      subscriptionId: 'subscription-id-2',
      accountId: 'account-id',
      externalId: 'external-payment-id-3',
      type: 'subscription',
      method: 'credit_card',
      description: 'Pagamento mensal - Plano Premium',
      amount: 99.99,
      currency: 'COP',
      status: 'APPROVED',
      paymentDate: new Date('2025-03-15T00:00:00Z')
    } as SubscriptionPayment
  ];

  beforeEach(async () => {
    // Resetar todos os mocks antes de cada teste
    jest.restoreAllMocks();
    
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetSubscriptionHistoryUseCase,
        {
          provide: ISubscriptionRepository,
          useValue: {
            findAllByAccountId: jest.fn(),
          },
        },
        {
          provide: ISubscriptionPaymentRepository,
          useValue: {
            findAllBySubscriptionId: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetSubscriptionHistoryUseCase>(GetSubscriptionHistoryUseCase);
    subscriptionRepository = module.get<ISubscriptionRepository>(ISubscriptionRepository);
    subscriptionPaymentRepository = module.get<ISubscriptionPaymentRepository>(ISubscriptionPaymentRepository);
  });
  
  afterEach(() => {
    // Limpar todos os mocks após cada teste
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return all subscriptions with their payments', async () => {
      // Arrange
      const accountId = 'account-id';
      jest.spyOn(subscriptionRepository, 'findAllByAccountId').mockResolvedValue(mockSubscriptions);
      
      // Mock para retornar os pagamentos para cada assinatura
      jest.spyOn(subscriptionPaymentRepository, 'findAllBySubscriptionId')
        .mockImplementation((subscriptionId: string) => {
          if (subscriptionId === 'subscription-id-1') {
            return Promise.resolve(mockPaymentsForSubscription1);
          } else if (subscriptionId === 'subscription-id-2') {
            return Promise.resolve(mockPaymentsForSubscription2);
          }
          return Promise.resolve([]);
        });

      // Act
      const result = await useCase.execute({ accountId });

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toEqual(2);
      
      // Verificar a primeira assinatura e seus pagamentos
      expect(result[0].id).toEqual('subscription-id-1');
      expect(result[0].payments).toBeDefined();
      expect(result[0].payments.length).toEqual(2);
      expect(result[0].payments[0].id).toEqual('payment-id-1');
      expect(result[0].payments[1].id).toEqual('payment-id-2');
      
      // Verificar a segunda assinatura e seus pagamentos
      expect(result[1].id).toEqual('subscription-id-2');
      expect(result[1].payments).toBeDefined();
      expect(result[1].payments.length).toEqual(1);
      expect(result[1].payments[0].id).toEqual('payment-id-3');
      
      // Verificar que os métodos do repositório foram chamados corretamente
      expect(subscriptionRepository.findAllByAccountId).toHaveBeenCalledWith(accountId);
      expect(subscriptionPaymentRepository.findAllBySubscriptionId).toHaveBeenCalledWith('subscription-id-1');
      expect(subscriptionPaymentRepository.findAllBySubscriptionId).toHaveBeenCalledWith('subscription-id-2');
      expect(subscriptionPaymentRepository.findAllBySubscriptionId).toHaveBeenCalledTimes(2);
    });

    it('should return subscriptions with empty payments array when no payments are found', async () => {
      // Arrange
      const accountId = 'account-id';
      jest.spyOn(subscriptionRepository, 'findAllByAccountId').mockResolvedValue(mockSubscriptions);
      
      // Mock para retornar array vazio para todos os pagamentos
      jest.spyOn(subscriptionPaymentRepository, 'findAllBySubscriptionId').mockResolvedValue([]);

      // Act
      const result = await useCase.execute({ accountId });

      // Assert
      expect(result).toBeDefined();
      expect(result.length).toEqual(2);
      
      // Verificar que ambas as assinaturas têm arrays de pagamentos vazios
      expect(result[0].payments).toBeDefined();
      expect(result[0].payments.length).toEqual(0);
      expect(result[1].payments).toBeDefined();
      expect(result[1].payments.length).toEqual(0);
      
      // Verificar que os métodos do repositório foram chamados corretamente
      expect(subscriptionRepository.findAllByAccountId).toHaveBeenCalledWith(accountId);
      expect(subscriptionPaymentRepository.findAllBySubscriptionId).toHaveBeenCalledWith('subscription-id-1');
      expect(subscriptionPaymentRepository.findAllBySubscriptionId).toHaveBeenCalledWith('subscription-id-2');
      expect(subscriptionPaymentRepository.findAllBySubscriptionId).toHaveBeenCalledTimes(2);
    });

    it('should throw an error when no subscriptions are found', async () => {
      // Arrange
      const accountId = 'account-id';
      jest.spyOn(subscriptionRepository, 'findAllByAccountId').mockResolvedValue([]);
      jest.spyOn(subscriptionPaymentRepository, 'findAllBySubscriptionId'); // Spy, mas não deve ser chamado

      // Act & Assert
      await expect(useCase.execute({ accountId }))
        .rejects
        .toThrow('notfound.subscription.history.do.not.exists');
      
      expect(subscriptionRepository.findAllByAccountId).toHaveBeenCalledWith(accountId);
      expect(subscriptionPaymentRepository.findAllBySubscriptionId).not.toHaveBeenCalled();
    });

    it('should throw an error when subscriptions is null', async () => {
      // Arrange
      const accountId = 'account-id';
      jest.spyOn(subscriptionRepository, 'findAllByAccountId').mockResolvedValue(null);
      jest.spyOn(subscriptionPaymentRepository, 'findAllBySubscriptionId'); // Spy, mas não deve ser chamado

      // Act & Assert
      await expect(useCase.execute({ accountId }))
        .rejects
        .toThrow('notfound.subscription.history.do.not.exists');
      
      expect(subscriptionRepository.findAllByAccountId).toHaveBeenCalledWith(accountId);
      expect(subscriptionPaymentRepository.findAllBySubscriptionId).not.toHaveBeenCalled();
    });
  });
});

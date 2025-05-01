import { Test, TestingModule } from '@nestjs/testing';
import { CancelSubscriptionOnPaymentGatewayUseCase } from './cancel-subscription-on-payment-gateway.use-case';
import { ISubscriptionRepository } from 'src/application/interfaces/repositories/subscription.repository.interface';
import { IPaymentGateway } from 'src/application/interfaces/payment-gateway/payment-gateway.interface';
import { CreateInternalSubscriptionUseCase } from './create-internal-subscription.use-case';
import { UpdateFirebaseUsersDataUseCase } from '../user/update-firebase-users-data.use-case';
import { ConfigService } from '@nestjs/config';
import { IAccountRepository } from 'src/application/interfaces/repositories/account.repository.interface';
import { Subscription, SubscriptionStatus } from 'src/domain/entities/subscription';

describe('CancelSubscriptionOnPaymentGatewayUseCase', () => {
  let useCase: CancelSubscriptionOnPaymentGatewayUseCase;
  let subscriptionRepository: jest.Mocked<ISubscriptionRepository>;
  let paymentGateway: jest.Mocked<IPaymentGateway>;
  let createInternalSubscriptionUseCase: jest.Mocked<CreateInternalSubscriptionUseCase>;
  let updateFirebaseUsersDataUseCase: jest.Mocked<UpdateFirebaseUsersDataUseCase>;
  let configService: jest.Mocked<ConfigService>;
  let accountRepository: jest.Mocked<IAccountRepository>;

  // Mocks
  const mockSubscriptionId = 'subscription-123';
  const mockAccountId = 'account-123';
  const mockExternalId = 'external-123';
  const mockFreePlanId = 'free-plan-id';
  
  // Mock para Subscription ativa sem data de pagamento
  const mockActiveSubscription: Subscription = {
    id: mockSubscriptionId,
    accountId: mockAccountId,
    externalId: mockExternalId,
    planId: 'paid-plan-id',
    status: SubscriptionStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date()
  } as Subscription;
  
  // Mock para Subscription ativa com data de pagamento
  const mockPaymentDate = new Date('2025-04-15T10:00:00Z');
  const mockActiveSubscriptionWithPaymentDate: Subscription = {
    ...mockActiveSubscription,
    paymentDate: mockPaymentDate
  };

  // Mock para Subscription pendente
  const mockPendingSubscription: Subscription = {
    ...mockActiveSubscription,
    status: SubscriptionStatus.PENDING
  };

  beforeEach(async () => {
    // Mocks para os repositórios e serviços
    subscriptionRepository = {
      findOneById: jest.fn(),
      cancelOnPaymentGateway: jest.fn()
    } as any;

    paymentGateway = {
      cancelSubscription: jest.fn()
    } as any;

    createInternalSubscriptionUseCase = {
      execute: jest.fn()
    } as any;

    updateFirebaseUsersDataUseCase = {
      execute: jest.fn()
    } as any;

    configService = {
      get: jest.fn().mockReturnValue(mockFreePlanId)
    } as any;

    accountRepository = {
      updatePlan: jest.fn()
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CancelSubscriptionOnPaymentGatewayUseCase,
        {
          provide: ISubscriptionRepository,
          useValue: subscriptionRepository,
        },
        {
          provide: IPaymentGateway,
          useValue: paymentGateway,
        },
        {
          provide: CreateInternalSubscriptionUseCase,
          useValue: createInternalSubscriptionUseCase,
        },
        {
          provide: UpdateFirebaseUsersDataUseCase,
          useValue: updateFirebaseUsersDataUseCase,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
        {
          provide: IAccountRepository,
          useValue: accountRepository,
        },
      ],
    }).compile();

    useCase = module.get<CancelSubscriptionOnPaymentGatewayUseCase>(CancelSubscriptionOnPaymentGatewayUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should cancel an active subscription without payment date using current date immediately', async () => {
    // Arrange
    subscriptionRepository.findOneById.mockResolvedValue(mockActiveSubscription);
    paymentGateway.cancelSubscription.mockResolvedValue(true);
    
    // Act
    await useCase.execute({ id: mockSubscriptionId, accountId: mockAccountId });

    // Assert
    expect(subscriptionRepository.findOneById).toHaveBeenCalledWith(mockSubscriptionId);
    expect(paymentGateway.cancelSubscription).toHaveBeenCalledWith(mockExternalId);
    
    // Verificar que a data efetiva de cancelamento foi definida para a data atual
    expect(subscriptionRepository.cancelOnPaymentGateway).toHaveBeenCalledWith(
      mockSubscriptionId,
      expect.any(Date)
    );
    
    // Verificar que a data está próxima da data atual
    const effectiveCancellationDate = subscriptionRepository.cancelOnPaymentGateway.mock.calls[0][1];
    const expectedDate = new Date();
    
    // Permitir uma diferença de até 1 segundo devido ao tempo de execução do teste
    const timeDifference = Math.abs(effectiveCancellationDate.getTime() - expectedDate.getTime());
    expect(timeDifference).toBeLessThan(1000);
    
    expect(updateFirebaseUsersDataUseCase.execute).toHaveBeenCalledWith({
      accountId: mockAccountId
    });
  });
  
  it('should cancel an active subscription with payment date using payment date + 1 day', async () => {
    // Arrange
    subscriptionRepository.findOneById.mockResolvedValue(mockActiveSubscriptionWithPaymentDate);
    paymentGateway.cancelSubscription.mockResolvedValue(true);
    
    // Act
    await useCase.execute({ id: mockSubscriptionId, accountId: mockAccountId });

    // Assert
    expect(subscriptionRepository.findOneById).toHaveBeenCalledWith(mockSubscriptionId);
    expect(paymentGateway.cancelSubscription).toHaveBeenCalledWith(mockExternalId);
    
    // Verificar que a data efetiva de cancelamento foi definida para payment date + 1 dia
    expect(subscriptionRepository.cancelOnPaymentGateway).toHaveBeenCalledWith(
      mockSubscriptionId,
      expect.any(Date)
    );
    
    // Verificar que a data está exatamente 1 dia após a data de pagamento
    const effectiveCancellationDate = subscriptionRepository.cancelOnPaymentGateway.mock.calls[0][1];
    const expectedDate = new Date(mockPaymentDate);
    expectedDate.setDate(expectedDate.getDate() + 1);
    
    expect(effectiveCancellationDate.getTime()).toBe(expectedDate.getTime());
    
    expect(updateFirebaseUsersDataUseCase.execute).toHaveBeenCalledWith({
      accountId: mockAccountId
    });
  });

  it('should cancel a pending subscription on payment gateway successfully', async () => {
    // Arrange
    subscriptionRepository.findOneById.mockResolvedValue(mockPendingSubscription);
    paymentGateway.cancelSubscription.mockResolvedValue(true);
    
    // Act
    await useCase.execute({ id: mockSubscriptionId, accountId: mockAccountId });

    // Assert
    expect(subscriptionRepository.findOneById).toHaveBeenCalledWith(mockSubscriptionId);
    expect(paymentGateway.cancelSubscription).toHaveBeenCalledWith(mockExternalId);
    expect(subscriptionRepository.cancelOnPaymentGateway).toHaveBeenCalledWith(
      mockSubscriptionId,
      expect.any(Date)
    );
    expect(updateFirebaseUsersDataUseCase.execute).toHaveBeenCalledWith({
      accountId: mockAccountId
    });
  });

  it('should throw an error when subscription does not exist', async () => {
    // Arrange
    subscriptionRepository.findOneById.mockResolvedValue(null);
    
    // Act & Assert
    await expect(useCase.execute({ id: mockSubscriptionId, accountId: mockAccountId }))
      .rejects.toThrow('error.subscription.do.not.exists');
    
    expect(subscriptionRepository.findOneById).toHaveBeenCalledWith(mockSubscriptionId);
    expect(paymentGateway.cancelSubscription).not.toHaveBeenCalled();
    expect(subscriptionRepository.cancelOnPaymentGateway).not.toHaveBeenCalled();
    expect(updateFirebaseUsersDataUseCase.execute).not.toHaveBeenCalled();
  });

  it('should throw an error when subscription is a free plan', async () => {
    // Arrange
    const freeSubscription = {
      ...mockActiveSubscription,
      planId: mockFreePlanId
    };
    subscriptionRepository.findOneById.mockResolvedValue(freeSubscription);
    
    // Act & Assert
    await expect(useCase.execute({ id: mockSubscriptionId, accountId: mockAccountId }))
      .rejects.toThrow('error.subscription.do.not.exists');
    
    expect(subscriptionRepository.findOneById).toHaveBeenCalledWith(mockSubscriptionId);
    expect(paymentGateway.cancelSubscription).not.toHaveBeenCalled();
    expect(subscriptionRepository.cancelOnPaymentGateway).not.toHaveBeenCalled();
    expect(updateFirebaseUsersDataUseCase.execute).not.toHaveBeenCalled();
  });

  it('should throw an error when subscription status is not ACTIVE or PENDING', async () => {
    // Arrange
    const cancelledSubscription = {
      ...mockActiveSubscription,
      status: SubscriptionStatus.CANCELLED
    };
    subscriptionRepository.findOneById.mockResolvedValue(cancelledSubscription);
    
    // Act & Assert
    await expect(useCase.execute({ id: mockSubscriptionId, accountId: mockAccountId }))
      .rejects.toThrow('error.subscription.do.not.exists');
    
    expect(subscriptionRepository.findOneById).toHaveBeenCalledWith(mockSubscriptionId);
    expect(paymentGateway.cancelSubscription).not.toHaveBeenCalled();
    expect(subscriptionRepository.cancelOnPaymentGateway).not.toHaveBeenCalled();
    expect(updateFirebaseUsersDataUseCase.execute).not.toHaveBeenCalled();
  });

  it('should throw an error when payment gateway cancellation fails', async () => {
    // Arrange
    subscriptionRepository.findOneById.mockResolvedValue(mockActiveSubscription);
    paymentGateway.cancelSubscription.mockResolvedValue(false);
    
    // Act & Assert
    await expect(useCase.execute({ id: mockSubscriptionId, accountId: mockAccountId }))
      .rejects.toThrow('error.subscription.cancel.on.payment.gateway.failed');
    
    expect(subscriptionRepository.findOneById).toHaveBeenCalledWith(mockSubscriptionId);
    expect(paymentGateway.cancelSubscription).toHaveBeenCalledWith(mockExternalId);
    expect(subscriptionRepository.cancelOnPaymentGateway).not.toHaveBeenCalled();
    expect(updateFirebaseUsersDataUseCase.execute).not.toHaveBeenCalled();
  });

  it('should throw an error when payment gateway throws an exception', async () => {
    // Arrange
    subscriptionRepository.findOneById.mockResolvedValue(mockActiveSubscription);
    paymentGateway.cancelSubscription.mockRejectedValue(new Error('Payment gateway error'));
    
    // Act & Assert
    await expect(useCase.execute({ id: mockSubscriptionId, accountId: mockAccountId }))
      .rejects.toThrow('Payment gateway error');
    
    expect(subscriptionRepository.findOneById).toHaveBeenCalledWith(mockSubscriptionId);
    expect(paymentGateway.cancelSubscription).toHaveBeenCalledWith(mockExternalId);
    expect(subscriptionRepository.cancelOnPaymentGateway).not.toHaveBeenCalled();
    expect(updateFirebaseUsersDataUseCase.execute).not.toHaveBeenCalled();
  });

  it('should throw an error when repository throws an exception', async () => {
    // Arrange
    subscriptionRepository.findOneById.mockRejectedValue(new Error('Database error'));
    
    // Act & Assert
    await expect(useCase.execute({ id: mockSubscriptionId, accountId: mockAccountId }))
      .rejects.toThrow('Database error');
    
    expect(subscriptionRepository.findOneById).toHaveBeenCalledWith(mockSubscriptionId);
    expect(paymentGateway.cancelSubscription).not.toHaveBeenCalled();
    expect(subscriptionRepository.cancelOnPaymentGateway).not.toHaveBeenCalled();
    expect(updateFirebaseUsersDataUseCase.execute).not.toHaveBeenCalled();
  });

  it('should throw an error when Firebase update throws an exception', async () => {
    // Arrange
    subscriptionRepository.findOneById.mockResolvedValue(mockActiveSubscription);
    paymentGateway.cancelSubscription.mockResolvedValue(true);
    subscriptionRepository.cancelOnPaymentGateway.mockResolvedValue(undefined);
    updateFirebaseUsersDataUseCase.execute.mockRejectedValue(new Error('Firebase error'));
    
    // Act & Assert
    await expect(useCase.execute({ id: mockSubscriptionId, accountId: mockAccountId }))
      .rejects.toThrow('Firebase error');
    
    expect(subscriptionRepository.findOneById).toHaveBeenCalledWith(mockSubscriptionId);
    expect(paymentGateway.cancelSubscription).toHaveBeenCalledWith(mockExternalId);
    expect(subscriptionRepository.cancelOnPaymentGateway).toHaveBeenCalledWith(
      mockSubscriptionId,
      expect.any(Date)
    );
    expect(updateFirebaseUsersDataUseCase.execute).toHaveBeenCalledWith({
      accountId: mockAccountId
    });
  });
});

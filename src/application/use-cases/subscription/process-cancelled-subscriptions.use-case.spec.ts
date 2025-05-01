import { Test, TestingModule } from '@nestjs/testing';
import { ProcessCancelledSubscriptionsUseCase } from './process-cancelled-subscriptions.use-case';
import { ISubscriptionRepository } from 'src/application/interfaces/repositories/subscription.repository.interface';
import { IAccountRepository } from 'src/application/interfaces/repositories/account.repository.interface';
import { ConfigService } from '@nestjs/config';
import { UpdateFirebaseUsersDataUseCase } from '../user/update-firebase-users-data.use-case';
import { CreateInternalSubscriptionUseCase } from './create-internal-subscription.use-case';
import { Subscription, SubscriptionStatus } from 'src/domain/entities/subscription';
import { Logger } from '@nestjs/common';

describe('ProcessCancelledSubscriptionsUseCase', () => {
  let useCase: ProcessCancelledSubscriptionsUseCase;
  let subscriptionRepository: jest.Mocked<ISubscriptionRepository>;
  let accountRepository: jest.Mocked<IAccountRepository>;
  let updateFirebaseUsersDataUseCase: jest.Mocked<UpdateFirebaseUsersDataUseCase>;
  let createInternalSubscriptionUseCase: jest.Mocked<CreateInternalSubscriptionUseCase>;
  let configService: jest.Mocked<ConfigService>;
  let loggerSpy: jest.SpyInstance;

  // Mocks
  const mockAccountId = 'account-123';
  const mockSubscriptionId = 'subscription-123';
  const mockNewSubscriptionId = 'new-subscription-123';
  const mockFreePlanId = 'free-plan-id';
  
  // Mock para Subscription
  const mockSubscription: Subscription = {
    id: mockSubscriptionId,
    accountId: mockAccountId,
    planId: 'paid-plan-id',
    status: SubscriptionStatus.CANCELLED_ON_PAYMENT_GATEWAY,
    effectiveCancellationDate: new Date(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 dias atrás
    updatedAt: new Date()
  } as Subscription;

  // Mock para nova Subscription
  const mockNewSubscription: Subscription = {
    id: mockNewSubscriptionId,
    accountId: mockAccountId,
    planId: mockFreePlanId,
    status: SubscriptionStatus.CREATED,
    createdAt: new Date(),
    updatedAt: new Date()
  } as Subscription;

  beforeEach(async () => {
    // Mocks para os repositórios e serviços
    subscriptionRepository = {
      findSubscriptionsToCancel: jest.fn(),
      cancel: jest.fn(),
      active: jest.fn()
    } as any;

    accountRepository = {
      updatePlan: jest.fn()
    } as any;

    updateFirebaseUsersDataUseCase = {
      execute: jest.fn()
    } as any;

    createInternalSubscriptionUseCase = {
      execute: jest.fn()
    } as any;

    configService = {
      get: jest.fn().mockReturnValue(mockFreePlanId)
    } as any;

    // Mock para o Logger
    loggerSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessCancelledSubscriptionsUseCase,
        {
          provide: ISubscriptionRepository,
          useValue: subscriptionRepository,
        },
        {
          provide: IAccountRepository,
          useValue: accountRepository,
        },
        {
          provide: UpdateFirebaseUsersDataUseCase,
          useValue: updateFirebaseUsersDataUseCase,
        },
        {
          provide: CreateInternalSubscriptionUseCase,
          useValue: createInternalSubscriptionUseCase,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    useCase = module.get<ProcessCancelledSubscriptionsUseCase>(ProcessCancelledSubscriptionsUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should process cancelled subscriptions successfully', async () => {
    // Arrange
    const currentDate = new Date();
    subscriptionRepository.findSubscriptionsToCancel.mockResolvedValue([mockSubscription]);
    createInternalSubscriptionUseCase.execute.mockResolvedValue(mockNewSubscription);
    
    // Act
    await useCase.execute();

    // Assert
    expect(subscriptionRepository.findSubscriptionsToCancel).toHaveBeenCalledWith(expect.any(Date));
    expect(subscriptionRepository.cancel).toHaveBeenCalledWith(mockSubscriptionId);
    expect(createInternalSubscriptionUseCase.execute).toHaveBeenCalledWith({
      accountId: mockAccountId,
      planId: mockFreePlanId
    });
    expect(subscriptionRepository.active).toHaveBeenCalledWith(mockNewSubscriptionId);
    expect(accountRepository.updatePlan).toHaveBeenCalledWith(mockAccountId, mockFreePlanId);
    expect(updateFirebaseUsersDataUseCase.execute).toHaveBeenCalledWith({
      accountId: mockAccountId
    });
  });

  it('should process multiple cancelled subscriptions', async () => {
    // Arrange
    const mockSubscription2 = {
      ...mockSubscription,
      id: 'subscription-456',
      accountId: 'account-456'
    };
    
    const mockNewSubscription2 = {
      ...mockNewSubscription,
      id: 'new-subscription-456',
      accountId: 'account-456'
    };

    subscriptionRepository.findSubscriptionsToCancel.mockResolvedValue([mockSubscription, mockSubscription2]);
    
    createInternalSubscriptionUseCase.execute
      .mockResolvedValueOnce(mockNewSubscription)
      .mockResolvedValueOnce(mockNewSubscription2);
    
    // Act
    await useCase.execute();

    // Assert
    expect(subscriptionRepository.findSubscriptionsToCancel).toHaveBeenCalledWith(expect.any(Date));
    
    // Verificar primeira assinatura
    expect(subscriptionRepository.cancel).toHaveBeenCalledWith(mockSubscriptionId);
    expect(createInternalSubscriptionUseCase.execute).toHaveBeenCalledWith({
      accountId: mockAccountId,
      planId: mockFreePlanId
    });
    expect(subscriptionRepository.active).toHaveBeenCalledWith(mockNewSubscriptionId);
    expect(accountRepository.updatePlan).toHaveBeenCalledWith(mockAccountId, mockFreePlanId);
    expect(updateFirebaseUsersDataUseCase.execute).toHaveBeenCalledWith({
      accountId: mockAccountId
    });
    
    // Verificar segunda assinatura
    expect(subscriptionRepository.cancel).toHaveBeenCalledWith('subscription-456');
    expect(createInternalSubscriptionUseCase.execute).toHaveBeenCalledWith({
      accountId: 'account-456',
      planId: mockFreePlanId
    });
    expect(subscriptionRepository.active).toHaveBeenCalledWith('new-subscription-456');
    expect(accountRepository.updatePlan).toHaveBeenCalledWith('account-456', mockFreePlanId);
    expect(updateFirebaseUsersDataUseCase.execute).toHaveBeenCalledWith({
      accountId: 'account-456'
    });
  });

  it('should do nothing when no subscriptions need to be cancelled', async () => {
    // Arrange
    subscriptionRepository.findSubscriptionsToCancel.mockResolvedValue([]);
    
    // Act
    await useCase.execute();

    // Assert
    expect(subscriptionRepository.findSubscriptionsToCancel).toHaveBeenCalledWith(expect.any(Date));
    expect(subscriptionRepository.cancel).not.toHaveBeenCalled();
    expect(createInternalSubscriptionUseCase.execute).not.toHaveBeenCalled();
    expect(subscriptionRepository.active).not.toHaveBeenCalled();
    expect(accountRepository.updatePlan).not.toHaveBeenCalled();
    expect(updateFirebaseUsersDataUseCase.execute).not.toHaveBeenCalled();
  });

  it('should continue processing other subscriptions when one fails', async () => {
    // Arrange
    const mockSubscription2 = {
      ...mockSubscription,
      id: 'subscription-456',
      accountId: 'account-456'
    };
    
    const mockNewSubscription2 = {
      ...mockNewSubscription,
      id: 'new-subscription-456',
      accountId: 'account-456'
    };

    subscriptionRepository.findSubscriptionsToCancel.mockResolvedValue([mockSubscription, mockSubscription2]);
    
    // Primeira assinatura falha ao cancelar
    subscriptionRepository.cancel
      .mockRejectedValueOnce(new Error('Erro ao cancelar'))
      .mockResolvedValueOnce(undefined);
    
    createInternalSubscriptionUseCase.execute.mockResolvedValue(mockNewSubscription2);
    
    // Act
    await useCase.execute();

    // Assert
    expect(subscriptionRepository.findSubscriptionsToCancel).toHaveBeenCalledWith(expect.any(Date));
    
    // Verificar que a primeira assinatura falhou mas a segunda foi processada
    expect(subscriptionRepository.cancel).toHaveBeenCalledWith(mockSubscriptionId);
    expect(subscriptionRepository.cancel).toHaveBeenCalledWith('subscription-456');
    
    // A segunda assinatura deve ter sido processada completamente
    expect(createInternalSubscriptionUseCase.execute).toHaveBeenCalledWith({
      accountId: 'account-456',
      planId: mockFreePlanId
    });
    expect(subscriptionRepository.active).toHaveBeenCalledWith(expect.any(String));
    expect(accountRepository.updatePlan).toHaveBeenCalledWith('account-456', mockFreePlanId);
    expect(updateFirebaseUsersDataUseCase.execute).toHaveBeenCalledWith({
      accountId: 'account-456'
    });
  });

  it('should handle errors in executeScheduled without throwing', async () => {
    // Arrange
    subscriptionRepository.findSubscriptionsToCancel.mockRejectedValue(new Error('Database error'));
    
    // Act - não deve lançar exceção
    await useCase.executeScheduled();

    // Assert
    expect(subscriptionRepository.findSubscriptionsToCancel).toHaveBeenCalledWith(expect.any(Date));
    expect(Logger.prototype.error).toHaveBeenCalled();
  });

  it('should handle errors in create internal subscription', async () => {
    // Arrange
    subscriptionRepository.findSubscriptionsToCancel.mockResolvedValue([mockSubscription]);
    subscriptionRepository.cancel.mockResolvedValue(undefined);
    createInternalSubscriptionUseCase.execute.mockRejectedValue(new Error('Erro ao criar assinatura'));
    
    // Act
    await useCase.execute();

    // Assert
    expect(subscriptionRepository.findSubscriptionsToCancel).toHaveBeenCalledWith(expect.any(Date));
    expect(subscriptionRepository.cancel).toHaveBeenCalledWith(mockSubscriptionId);
    expect(createInternalSubscriptionUseCase.execute).toHaveBeenCalledWith({
      accountId: mockAccountId,
      planId: mockFreePlanId
    });
    expect(Logger.prototype.error).toHaveBeenCalled();
    
    // Não deve ter continuado o processamento após o erro
    expect(subscriptionRepository.active).not.toHaveBeenCalled();
    expect(accountRepository.updatePlan).not.toHaveBeenCalled();
    expect(updateFirebaseUsersDataUseCase.execute).not.toHaveBeenCalled();
  });

  it('should handle errors in update Firebase users data', async () => {
    // Arrange
    subscriptionRepository.findSubscriptionsToCancel.mockResolvedValue([mockSubscription]);
    createInternalSubscriptionUseCase.execute.mockResolvedValue(mockNewSubscription);
    accountRepository.updatePlan.mockResolvedValue(undefined);
    updateFirebaseUsersDataUseCase.execute.mockRejectedValue(new Error('Erro ao atualizar Firebase'));
    
    // Act
    await useCase.execute();

    // Assert
    expect(subscriptionRepository.findSubscriptionsToCancel).toHaveBeenCalledWith(expect.any(Date));
    expect(subscriptionRepository.cancel).toHaveBeenCalledWith(mockSubscriptionId);
    expect(createInternalSubscriptionUseCase.execute).toHaveBeenCalledWith({
      accountId: mockAccountId,
      planId: mockFreePlanId
    });
    expect(subscriptionRepository.active).toHaveBeenCalledWith(mockNewSubscriptionId);
    expect(accountRepository.updatePlan).toHaveBeenCalledWith(mockAccountId, mockFreePlanId);
    expect(updateFirebaseUsersDataUseCase.execute).toHaveBeenCalledWith({
      accountId: mockAccountId
    });
    expect(Logger.prototype.error).toHaveBeenCalled();
  });
});

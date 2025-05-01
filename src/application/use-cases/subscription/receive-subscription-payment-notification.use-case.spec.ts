import { Test, TestingModule } from '@nestjs/testing';
import { ReceiveSubscriptionPaymentNotificationUseCase } from './receive-subscription-payment-notification.use-case';
import { ISubscriptionRepository } from 'src/application/interfaces/repositories/subscription.repository.interface';
import { IPaymentGateway } from 'src/application/interfaces/payment-gateway/payment-gateway.interface';
import { ISubscriptionPaymentRepository } from 'src/application/interfaces/repositories/subscription-payment.repository.interface';
import { ISubscriptionNotificationRepository } from 'src/application/interfaces/repositories/subscription-notification.repository.interface';
import { UpdateFirebaseUsersDataUseCase } from '../user/update-firebase-users-data.use-case';
import { ConfigService } from '@nestjs/config';
import { Subscription, SubscriptionStatus } from 'src/domain/entities/subscription';
import { SubscriptionPayment, SubscriptionPaymentStatus } from 'src/domain/entities/subscription-payment';
import { SubscriptionNotification, SubscriptionNotificationAction, SubscriptionNotificationType } from 'src/domain/entities/subscription-notification';

describe('ReceiveSubscriptionPaymentNotificationUseCase', () => {
  let useCase: ReceiveSubscriptionPaymentNotificationUseCase;
  let subscriptionRepository: jest.Mocked<ISubscriptionRepository>;
  let subscriptionPaymentRepository: jest.Mocked<ISubscriptionPaymentRepository>;
  let subscriptionNotificationRepository: jest.Mocked<ISubscriptionNotificationRepository>;
  let paymentGateway: jest.Mocked<IPaymentGateway>;
  let updateFirebaseUsersDataUseCase: jest.Mocked<UpdateFirebaseUsersDataUseCase>;
  let configService: jest.Mocked<ConfigService>;

  // Mocks
  const mockSubscriptionId = 'subscription-123';
  const mockAccountId = 'account-123';
  const mockExternalId = 'external-123';
  const mockExternalSubscriptionReference = 'external-sub-123';
  const mockExternalPayerReference = 'external-payer-123';
  const mockFirstSubscriptionPlanId = 'free-plan-id';
  const mockPaymentDate = new Date('2025-04-28T20:00:00Z');
  
  // Mock para Subscription
  const mockSubscription: Subscription = {
    id: mockSubscriptionId,
    accountId: mockAccountId,
    externalId: mockExternalId,
    planId: 'paid-plan-id',
    status: SubscriptionStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date()
  } as Subscription;

  // Mock para SubscriptionPayment
  const mockPayment: SubscriptionPayment = {
    id: 'payment-123',
    subscriptionId: mockSubscriptionId,
    accountId: mockAccountId,
    externalId: mockExternalId,
    externalSubscriptionReference: mockExternalSubscriptionReference,
    externalPayerReference: mockExternalPayerReference,
    status: SubscriptionPaymentStatus.APPROVED,
    amount: 100,
    currency: 'USD',
    type: 'CREDIT_CARD',
    method: 'VISA',
    description: 'Payment approved',
    paymentDate: mockPaymentDate,
    createdAt: new Date(),
    updatedAt: new Date()
  } as SubscriptionPayment;

  // Mock para SubscriptionNotification
  const mockNotification: SubscriptionNotification = {
    id: 'notification-123',
    type: SubscriptionNotificationType.PAYMENT,
    action: SubscriptionNotificationAction.CREATE,
    payload: {},
    payment: {
      x_transaction_id: mockExternalId,
      x_extra1: mockExternalSubscriptionReference,
      x_extra2: mockExternalPayerReference,
      x_transaction_state: 'Aceptada',
      x_amount: 100,
      x_currency_code: 'USD',
      x_franchise: 'VISA',
      x_response: 'Payment approved',
      x_transaction_date: '28/04/2025 20:00:00'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  } as SubscriptionNotification;

  beforeEach(async () => {
    // Mocks para os repositórios e serviços
    subscriptionRepository = {
      findOneByExternalId: jest.fn(),
      findOneByExternalPayerReference: jest.fn(),
      active: jest.fn(),
      findOneActiveByAccountId: jest.fn(),
      cancel: jest.fn(),
      updatePaymentDate: jest.fn(),
      updateNextPaymentDate: jest.fn()
    } as any;

    subscriptionPaymentRepository = {
      findOneByExternalId: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    } as any;

    subscriptionNotificationRepository = {} as any;

    paymentGateway = {
      getPayment: jest.fn()
    } as any;

    updateFirebaseUsersDataUseCase = {
      execute: jest.fn()
    } as any;

    configService = {
      get: jest.fn().mockReturnValue(mockFirstSubscriptionPlanId)
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReceiveSubscriptionPaymentNotificationUseCase,
        { provide: ISubscriptionRepository, useValue: subscriptionRepository },
        { provide: ISubscriptionPaymentRepository, useValue: subscriptionPaymentRepository },
        { provide: ISubscriptionNotificationRepository, useValue: subscriptionNotificationRepository },
        { provide: IPaymentGateway, useValue: paymentGateway },
        { provide: UpdateFirebaseUsersDataUseCase, useValue: updateFirebaseUsersDataUseCase },
        { provide: ConfigService, useValue: configService }
      ],
    }).compile();

    useCase = module.get<ReceiveSubscriptionPaymentNotificationUseCase>(ReceiveSubscriptionPaymentNotificationUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should process an approved payment notification and update payment date and nextPaymentDate', async () => {
    // Arrange
    paymentGateway.getPayment.mockResolvedValue(mockPayment);
    subscriptionRepository.findOneByExternalId.mockResolvedValue(mockSubscription);
    subscriptionPaymentRepository.findOneByExternalId.mockResolvedValue(null);
    subscriptionPaymentRepository.create.mockResolvedValue(mockPayment);
    subscriptionRepository.active.mockResolvedValue(mockSubscription);
    subscriptionRepository.findOneActiveByAccountId.mockResolvedValue(null);
    
    // Mock para a atualização da data de pagamento
    subscriptionRepository.updatePaymentDate.mockResolvedValue({
      ...mockSubscription,
      paymentDate: mockPaymentDate
    });
    
    // Mock para a atualização da data do próximo pagamento
    const mockNextPaymentDate = new Date(mockPaymentDate);
    mockNextPaymentDate.setDate(mockNextPaymentDate.getDate() + 30);
    subscriptionRepository.updateNextPaymentDate.mockResolvedValue({
      ...mockSubscription,
      paymentDate: mockPaymentDate,
      nextPaymentDate: mockNextPaymentDate
    });
    
    // Act
    await useCase.execute(mockNotification);
    
    // Assert
    expect(paymentGateway.getPayment).toHaveBeenCalledWith(mockNotification);
    expect(subscriptionRepository.findOneByExternalId).toHaveBeenCalledWith(mockExternalSubscriptionReference);
    expect(subscriptionPaymentRepository.create).toHaveBeenCalled();
    expect(subscriptionRepository.active).toHaveBeenCalledWith(mockSubscriptionId);
    expect(updateFirebaseUsersDataUseCase.execute).toHaveBeenCalledWith({ accountId: mockAccountId });
    expect(subscriptionRepository.updatePaymentDate).toHaveBeenCalledWith(mockSubscriptionId, mockPaymentDate);
    
    // Verificar a atualização da data do próximo pagamento
    const expectedNextPaymentDate = new Date(mockPaymentDate);
    expectedNextPaymentDate.setDate(expectedNextPaymentDate.getDate() + 30);
    expect(subscriptionRepository.updateNextPaymentDate).toHaveBeenCalledWith(mockSubscriptionId, expect.any(Date));
    
    // Verificar que a data do próximo pagamento é aproximadamente 30 dias após a data de pagamento
    const actualNextPaymentDate = subscriptionRepository.updateNextPaymentDate.mock.calls[0][1];
    const timeDifference = Math.abs(actualNextPaymentDate.getTime() - expectedNextPaymentDate.getTime());
    expect(timeDifference).toBeLessThan(1000); // Permitir diferença de até 1 segundo
  });

  it('should not update payment date or nextPaymentDate if payment is not approved', async () => {
    // Arrange
    const nonApprovedPayment = {
      ...mockPayment,
      status: SubscriptionPaymentStatus.PENDING
    };
    
    paymentGateway.getPayment.mockResolvedValue(nonApprovedPayment);
    subscriptionRepository.findOneByExternalId.mockResolvedValue(mockSubscription);
    subscriptionPaymentRepository.findOneByExternalId.mockResolvedValue(null);
    subscriptionPaymentRepository.create.mockResolvedValue(nonApprovedPayment);
    
    // Act
    await useCase.execute(mockNotification);
    
    // Assert
    expect(paymentGateway.getPayment).toHaveBeenCalledWith(mockNotification);
    expect(subscriptionRepository.findOneByExternalId).toHaveBeenCalledWith(mockExternalSubscriptionReference);
    expect(subscriptionPaymentRepository.create).toHaveBeenCalled();
    expect(subscriptionRepository.active).not.toHaveBeenCalled();
    expect(subscriptionRepository.updatePaymentDate).not.toHaveBeenCalled();
    expect(subscriptionRepository.updateNextPaymentDate).not.toHaveBeenCalled();
  });

  it('should not update payment date or nextPaymentDate if payment date is not available', async () => {
    // Arrange
    const paymentWithoutDate = {
      ...mockPayment,
      paymentDate: undefined
    };
    
    paymentGateway.getPayment.mockResolvedValue(paymentWithoutDate);
    subscriptionRepository.findOneByExternalId.mockResolvedValue(mockSubscription);
    subscriptionPaymentRepository.findOneByExternalId.mockResolvedValue(null);
    subscriptionPaymentRepository.create.mockResolvedValue(paymentWithoutDate);
    subscriptionRepository.active.mockResolvedValue(mockSubscription);
    subscriptionRepository.findOneActiveByAccountId.mockResolvedValue(null);
    
    // Act
    await useCase.execute(mockNotification);
    
    // Assert
    expect(paymentGateway.getPayment).toHaveBeenCalledWith(mockNotification);
    expect(subscriptionRepository.findOneByExternalId).toHaveBeenCalledWith(mockExternalSubscriptionReference);
    expect(subscriptionPaymentRepository.create).toHaveBeenCalled();
    expect(subscriptionRepository.active).toHaveBeenCalledWith(mockSubscriptionId);
    expect(subscriptionRepository.updatePaymentDate).not.toHaveBeenCalled();
    expect(subscriptionRepository.updateNextPaymentDate).not.toHaveBeenCalled();
  });

  it('should update existing payment when notification action is not CREATE', async () => {
    // Arrange
    const updateNotification = {
      ...mockNotification,
      action: SubscriptionNotificationAction.UPDATE
    } as SubscriptionNotification;
    
    paymentGateway.getPayment.mockResolvedValue(mockPayment);
    subscriptionRepository.findOneByExternalId.mockResolvedValue(mockSubscription);
    subscriptionPaymentRepository.findOneByExternalId.mockResolvedValue(mockPayment);
    subscriptionPaymentRepository.update.mockResolvedValue(mockPayment);
    subscriptionRepository.active.mockResolvedValue(mockSubscription);
    subscriptionRepository.findOneActiveByAccountId.mockResolvedValue(null);
    subscriptionRepository.updatePaymentDate.mockResolvedValue({
      ...mockSubscription,
      paymentDate: mockPaymentDate
    });
    
    // Act
    await useCase.execute(updateNotification);
    
    // Assert
    expect(paymentGateway.getPayment).toHaveBeenCalledWith(updateNotification);
    expect(subscriptionRepository.findOneByExternalId).toHaveBeenCalledWith(mockExternalSubscriptionReference);
    expect(subscriptionPaymentRepository.update).toHaveBeenCalledWith(mockPayment.id, mockPayment);
    expect(subscriptionRepository.active).toHaveBeenCalledWith(mockSubscriptionId);
    expect(subscriptionRepository.updatePaymentDate).toHaveBeenCalledWith(mockSubscriptionId, mockPaymentDate);
  });

  it('should find subscription by external payer reference if external subscription reference is not available', async () => {
    // Arrange
    const paymentWithoutSubRef = {
      ...mockPayment,
      externalSubscriptionReference: null
    };
    
    const notificationWithoutSubRef = {
      ...mockNotification,
      payment: {
        ...mockNotification.payment,
        x_extra1: null
      }
    } as SubscriptionNotification;
    
    paymentGateway.getPayment.mockResolvedValue(paymentWithoutSubRef);
    subscriptionRepository.findOneByExternalId.mockResolvedValue(null);
    subscriptionRepository.findOneByExternalPayerReference.mockResolvedValue(mockSubscription);
    subscriptionPaymentRepository.findOneByExternalId.mockResolvedValue(null);
    subscriptionPaymentRepository.create.mockResolvedValue(paymentWithoutSubRef);
    subscriptionRepository.active.mockResolvedValue(mockSubscription);
    subscriptionRepository.findOneActiveByAccountId.mockResolvedValue(null);
    subscriptionRepository.updatePaymentDate.mockResolvedValue({
      ...mockSubscription,
      paymentDate: mockPaymentDate
    });
    
    // Act
    await useCase.execute(notificationWithoutSubRef);
    
    // Assert
    expect(paymentGateway.getPayment).toHaveBeenCalledWith(notificationWithoutSubRef);
    expect(subscriptionRepository.findOneByExternalId).not.toHaveBeenCalled();
    expect(subscriptionRepository.findOneByExternalPayerReference).toHaveBeenCalledWith(mockExternalPayerReference);
    expect(subscriptionPaymentRepository.create).toHaveBeenCalled();
    expect(subscriptionRepository.active).toHaveBeenCalledWith(mockSubscriptionId);
    expect(subscriptionRepository.updatePaymentDate).toHaveBeenCalledWith(mockSubscriptionId, mockPaymentDate);
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { MongooseSubscriptionRepository } from './mongoose-subscription.repository';
import { getModelToken } from '@nestjs/mongoose';
import { Subscription as SubscriptionMongoose } from '../entities/subscription.entity';
import { Subscription, SubscriptionStatus } from 'src/domain/entities/subscription';
import { MongooseSubscriptionMapper } from '../mapper/mongoose-subscription.mapper';

describe('MongooseSubscriptionRepository', () => {
  let repository: MongooseSubscriptionRepository;
  let subscriptionModel: any;

  // Mocks
  const mockSubscriptionId = 'subscription-123';
  const mockAccountId = 'account-123';
  const mockExternalId = 'external-123';
  const mockPaymentDate = new Date('2025-04-28T20:00:00Z');
  
  // Mock para Subscription
  const mockSubscription: Subscription = {
    id: mockSubscriptionId,
    accountId: mockAccountId,
    externalId: mockExternalId,
    planId: 'paid-plan-id',
    status: SubscriptionStatus.ACTIVE,
    paymentDate: null,
    createdAt: new Date(),
    updatedAt: new Date()
  } as Subscription;

  // Mock para SubscriptionMongoose
  const mockSubscriptionMongoose = {
    _id: mockSubscriptionId,
    accountId: mockAccountId,
    externalId: mockExternalId,
    planId: 'paid-plan-id',
    status: SubscriptionStatus.ACTIVE,
    paymentDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    save: jest.fn(),
    toObject: jest.fn().mockReturnValue({
      _id: mockSubscriptionId,
      accountId: mockAccountId,
      externalId: mockExternalId,
      planId: 'paid-plan-id',
      status: SubscriptionStatus.ACTIVE,
      paymentDate: null,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  };

  beforeEach(async () => {
    // Mock completo para o modelo Mongoose com método exec encadeado
    subscriptionModel = {
      findById: jest.fn(),
      findOne: jest.fn(),
      findByIdAndUpdate: jest.fn().mockImplementation(() => ({
        exec: jest.fn()
      }))
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MongooseSubscriptionRepository,
        {
          provide: getModelToken(SubscriptionMongoose.name),
          useValue: subscriptionModel
        }
      ],
    }).compile();

    repository = module.get<MongooseSubscriptionRepository>(MongooseSubscriptionRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('updatePaymentDate', () => {
    it('should update the payment date of a subscription', async () => {
      // Arrange
      const updatedMongooseSubscription = {
        ...mockSubscriptionMongoose,
        paymentDate: mockPaymentDate,
        toObject: jest.fn().mockReturnValue({
          ...mockSubscriptionMongoose.toObject(),
          paymentDate: mockPaymentDate
        })
      };
      
      // Configurar o mock para retornar o documento atualizado
      subscriptionModel.findByIdAndUpdate.mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(updatedMongooseSubscription)
      }));
      
      // Spy no método toMongoose do mapper
      jest.spyOn(MongooseSubscriptionMapper, 'toDomain').mockReturnValue({
        ...mockSubscription,
        paymentDate: mockPaymentDate
      });
      
      // Act
      const result = await repository.updatePaymentDate(mockSubscriptionId, mockPaymentDate);
      
      // Assert
      expect(subscriptionModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockSubscriptionId,
        { paymentDate: mockPaymentDate },
        { new: true, select: { resultIntegration: 0 } }
      );
      expect(result).toBeDefined();
      expect(result.paymentDate).toEqual(mockPaymentDate);
    });

    it('should return null if subscription is not found', async () => {
      // Arrange
      subscriptionModel.findByIdAndUpdate.mockImplementation(() => ({
        exec: jest.fn().mockResolvedValue(null)
      }));
      
      // Act
      const result = await repository.updatePaymentDate(mockSubscriptionId, mockPaymentDate);
      
      // Assert
      expect(subscriptionModel.findByIdAndUpdate).toHaveBeenCalledWith(
        mockSubscriptionId,
        { paymentDate: mockPaymentDate },
        { new: true, select: { resultIntegration: 0 } }
      );
      expect(result).toBeNull();
    });
  });
});

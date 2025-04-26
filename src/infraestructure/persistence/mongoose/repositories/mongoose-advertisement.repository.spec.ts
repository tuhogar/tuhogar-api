import { Test, TestingModule } from '@nestjs/testing';
import { MongooseAdvertisementRepository } from './mongoose-advertisement.repository';
import { getModelToken } from '@nestjs/mongoose';
import { Advertisement as AdvertisementMongoose } from '../entities/advertisement.entity';
import { AdvertisementEvent as AdvertisementEventMongoose } from '../entities/advertisement-event.entity';
import { AdvertisementStatus } from 'src/domain/entities/advertisement';
import { Types } from 'mongoose';

describe('MongooseAdvertisementRepository', () => {
  let repository: MongooseAdvertisementRepository;
  let advertisementModel: any;
  let advertisementEventModel: any;

  const mockAccountId = new Types.ObjectId().toString();

  beforeEach(async () => {
    // Mock para o modelo Mongoose
    advertisementModel = {
      countDocuments: jest.fn().mockReturnThis(),
      exec: jest.fn(),
    };

    advertisementEventModel = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MongooseAdvertisementRepository,
        {
          provide: getModelToken(AdvertisementMongoose.name),
          useValue: advertisementModel,
        },
        {
          provide: getModelToken(AdvertisementEventMongoose.name),
          useValue: advertisementEventModel,
        },
      ],
    }).compile();

    repository = module.get<MongooseAdvertisementRepository>(MongooseAdvertisementRepository);
  });

  describe('countActiveOrWaitingByAccountId', () => {
    it('should count advertisements with ACTIVE or WAITING_FOR_APPROVAL status for an account', async () => {
      // Arrange
      const expectedCount = 5;
      advertisementModel.exec.mockResolvedValue(expectedCount);

      // Act
      const result = await repository.countActiveOrWaitingByAccountId(mockAccountId);

      // Assert
      expect(result).toBe(expectedCount);
      expect(advertisementModel.countDocuments).toHaveBeenCalledWith({
        accountId: expect.any(Types.ObjectId),
        status: { $in: [AdvertisementStatus.ACTIVE, AdvertisementStatus.WAITING_FOR_APPROVAL] }
      });
      
      // Verificar se o ObjectId foi criado corretamente com o accountId
      const callArgs = advertisementModel.countDocuments.mock.calls[0][0];
      expect(callArgs.accountId.toString()).toBe(new Types.ObjectId(mockAccountId).toString());
    });

    it('should return 0 when no advertisements match the criteria', async () => {
      // Arrange
      advertisementModel.exec.mockResolvedValue(0);

      // Act
      const result = await repository.countActiveOrWaitingByAccountId(mockAccountId);

      // Assert
      expect(result).toBe(0);
    });

    it('should handle invalid accountId by throwing an error', async () => {
      // Arrange
      const invalidAccountId = 'invalid-id';
      advertisementModel.countDocuments.mockImplementation(() => {
        throw new Error('Invalid ObjectId');
      });

      // Act & Assert
      await expect(repository.countActiveOrWaitingByAccountId(invalidAccountId))
        .rejects.toThrow();
    });
  });
});

import { MongoosePlanMapper } from './mongoose-plan.mapper';
import { Plan } from '../../../../domain/entities/plan';
import * as mongoose from 'mongoose';

describe('MongoosePlanMapper', () => {
  const mockId = new mongoose.Types.ObjectId();

  // Mock para o documento do Mongoose
  const mockMongooseDocument = {
    _id: mockId,
    name: 'Premium Plan',
    duration: 30,
    items: ['Feature 1', 'Feature 2'],
    price: 99.99,
    photo: 'https://example.com/photo.jpg',
    externalId: 'ext-123',
    maxAdvertisements: 10,
    maxPhotos: 20,
  };

  // Mock para a entidade de domínio
  const mockDomainEntity: Plan = {
    id: mockId.toString(),
    name: 'Premium Plan',
    duration: 30,
    items: ['Feature 1', 'Feature 2'],
    price: 99.99,
    photo: 'https://example.com/photo.jpg',
    externalId: 'ext-123',
    maxAdvertisements: 10,
    maxPhotos: 20,
  };

  describe('toDomain', () => {
    it('should convert mongoose document to domain entity', () => {
      // Act
      const result = MongoosePlanMapper.toDomain(mockMongooseDocument as any);

      // Assert
      expect(result).toBeInstanceOf(Plan);
      expect(result.id).toBe(mockId.toString());
      expect(result.name).toBe(mockMongooseDocument.name);
      expect(result.duration).toBe(mockMongooseDocument.duration);
      expect(result.items).toEqual(mockMongooseDocument.items);
      expect(result.price).toBe(mockMongooseDocument.price);
      expect(result.photo).toBe(mockMongooseDocument.photo);
      expect(result.externalId).toBe(mockMongooseDocument.externalId);
      expect(result.maxAdvertisements).toBe(mockMongooseDocument.maxAdvertisements);
      expect(result.maxPhotos).toBe(mockMongooseDocument.maxPhotos);
    });

    it('should return null when mongoose document is null', () => {
      // Act
      const result = MongoosePlanMapper.toDomain(null);

      // Assert
      expect(result).toBeNull();
    });

    it('should handle document without maxAdvertisements', () => {
      // Arrange
      const documentWithoutMaxAds = { ...mockMongooseDocument };
      delete documentWithoutMaxAds.maxAdvertisements;

      // Act
      const result = MongoosePlanMapper.toDomain(documentWithoutMaxAds as any);

      // Assert
      expect(result).toBeInstanceOf(Plan);
      expect(result.maxAdvertisements).toBeUndefined();
    });

    it('should handle document without maxPhotos', () => {
      // Arrange
      const documentWithoutMaxPhotos = { ...mockMongooseDocument };
      delete documentWithoutMaxPhotos.maxPhotos;

      // Act
      const result = MongoosePlanMapper.toDomain(documentWithoutMaxPhotos as any);

      // Assert
      expect(result).toBeInstanceOf(Plan);
      expect(result.maxPhotos).toBeUndefined();
    });
  });

  describe('toMongoose', () => {
    it('should convert domain entity to mongoose document', () => {
      // Act
      const result = MongoosePlanMapper.toMongoose(mockDomainEntity);

      // Assert
      expect(result).not.toHaveProperty('id');
      expect(result.name).toBe(mockDomainEntity.name);
      expect(result.duration).toBe(mockDomainEntity.duration);
      expect(result.items).toEqual(mockDomainEntity.items);
      expect(result.price).toBe(mockDomainEntity.price);
      expect(result.externalId).toBe(mockDomainEntity.externalId);
      expect(result.maxAdvertisements).toBe(mockDomainEntity.maxAdvertisements);
      expect(result.maxPhotos).toBe(mockDomainEntity.maxPhotos);
    });

    it('should handle domain entity without maxAdvertisements', () => {
      // Arrange
      const entityWithoutMaxAds = { ...mockDomainEntity };
      delete entityWithoutMaxAds.maxAdvertisements;

      // Act
      const result = MongoosePlanMapper.toMongoose(entityWithoutMaxAds);

      // Assert
      expect(result.maxAdvertisements).toBeUndefined();
    });

    it('should handle domain entity with maxAdvertisements set to zero', () => {
      // Arrange
      const entityWithZeroMaxAds = { ...mockDomainEntity, maxAdvertisements: 0 };

      // Act
      const result = MongoosePlanMapper.toMongoose(entityWithZeroMaxAds);

      // Assert
      expect(result.maxAdvertisements).toBe(0);
    });

    it('should handle domain entity without maxPhotos', () => {
      // Arrange
      const entityWithoutMaxPhotos = { ...mockDomainEntity };
      delete entityWithoutMaxPhotos.maxPhotos;

      // Act
      const result = MongoosePlanMapper.toMongoose(entityWithoutMaxPhotos);

      // Assert
      expect(result.maxPhotos).toBeUndefined();
    });

    it('should handle domain entity with maxPhotos set to zero', () => {
      // Arrange
      const entityWithZeroMaxPhotos = { ...mockDomainEntity, maxPhotos: 0 };

      // Act
      const result = MongoosePlanMapper.toMongoose(entityWithZeroMaxPhotos);

      // Assert
      expect(result.maxPhotos).toBe(0);
    });
  });
});

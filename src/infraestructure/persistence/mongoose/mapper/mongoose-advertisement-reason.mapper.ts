import { AdvertisementReason } from 'src/domain/entities/advertisement-reason';
import { AdvertisementReason as AdvertisementReasonDocument } from '../entities/advertisement-reason.entity';
import * as mongoose from 'mongoose';

export class MongooseAdvertisementReasonMapper {
    
    static toDomain(entity: AdvertisementReasonDocument): AdvertisementReason {
        if (!entity) return null;
        
        const model = new AdvertisementReason({
            _id: entity._id.toString(),
            id: entity._id.toString(),
            name: entity.name,
        });
        return model;
    }

    static toMongoose(advertisementReason: AdvertisementReason) {
        return {
            name: advertisementReason.name,
        }
    }
}
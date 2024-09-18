import { AdvertisementCode } from 'src/domain/entities/advertisement-code';
import { AdvertisementCode as AdvertisementCodeDocument } from '../entities/advertisement-code.entity';
import * as mongoose from 'mongoose';

export class MongooseAdvertisementCodeMapper {
    
    static toDomain(entity: AdvertisementCodeDocument): AdvertisementCode {
        if (!entity) return null;
        
        const model = new AdvertisementCode({
            _id: (entity._id as unknown as mongoose.Types.ObjectId).toString(),
            code: entity.code,
        });
        return model;
    }
}
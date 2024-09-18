import { Amenity } from 'src/domain/entities/amenity';
import { Amenity as AmenityDocument } from '../entities/amenity.entity';
import * as mongoose from 'mongoose';

export class MongooseAmenityMapper {
    
    static toDomain(entity: AmenityDocument): Amenity {
        if (!entity) return null;
        
        const model = new Amenity({
            _id: (entity._id as unknown as mongoose.Types.ObjectId).toString(),
            key: entity.key,
            name: entity.name,
        });
        return model;
    }

    static toMongoose(amenity: Amenity) {
        return {
            key: amenity.key,
            name: amenity.name,
        }
    }
}
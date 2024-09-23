import { Address } from 'src/domain/entities/address';
import * as mongoose from 'mongoose';

export class MongooseAddressMapper {
    
    static toDomain(entity: any): Address {
        if (!entity) return null;
        
        const model = new Address({
            country: entity.country,
            state: entity.state,
            city: entity.city,
            neighbourhood: entity.neighbourhood,
            street: entity.street,
            stateSlug: entity.stateSlug,
            citySlug: entity.citySlug,
            neighbourhoodSlug: entity.neighbourhoodSlug,
            latitude: entity.latitude,
            longitude: entity.longitude,
            postalCode: entity.postalCode,
            placeId: entity.placeId,
            establishment: entity.establishment,
        });
        return model;
    }
}
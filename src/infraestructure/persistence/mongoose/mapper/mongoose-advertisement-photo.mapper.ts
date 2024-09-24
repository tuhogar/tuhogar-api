import { Address } from 'src/domain/entities/address';
import * as mongoose from 'mongoose';
import { AdvertisementPhoto } from 'src/domain/entities/advertisement';

export class MongooseAdvertisementPhotoMapper {
    
    static toDomain(entity: any): AdvertisementPhoto {
        if (!entity) return null;
        
        const model = new AdvertisementPhoto({
            _id: entity.id.toString(),
            id: entity.id.toString(),
            name: entity.name,
            url: entity.url,
            thumbnailUrl: entity.thumbnailUrl,
            order: entity.order,
        });
        return model;
    }
}
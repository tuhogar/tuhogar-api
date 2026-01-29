import { AdvertisementEvent } from 'src/domain/entities/advertisement-event';
import { AdvertisementEvent as AdvertisementEventDocument } from '../entities/advertisement-event.entity';

export class MongooseAdvertisementEventMapper {
    
    static toDomain(entity: AdvertisementEventDocument): AdvertisementEvent {
        if (!entity) return null;
        
        const model = new AdvertisementEvent({
            id: entity._id.toString(),
            advertisementId: entity.advertisementId?.toString(),
            type: entity.type?.toString(),
            count: entity.count,
        });
        return model;
    }

    static toMongoose(advertisementEvent: AdvertisementEvent) {
        return {
            advertisementId: advertisementEvent.advertisementId,
            type: advertisementEvent.type,
            count: advertisementEvent.count
        }
    }
}
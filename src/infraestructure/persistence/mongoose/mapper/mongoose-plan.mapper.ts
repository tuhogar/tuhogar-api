import { Plan } from 'src/domain/entities/plan';
import { Plan as PlanDocument } from '../entities/plan.entity';

export class MongoosePlanMapper {
    
    static toDomain(entity: PlanDocument): Plan {
        if (!entity) return null;
        
        const model = new Plan({
            id: entity._id.toString(),
            name: entity.name,
            freeTrialDays: entity.freeTrialDays,
            items: entity.items,
            price: entity.price,
            photo: entity.photo,
            externalId: entity.externalId,
            maxAdvertisements: entity.maxAdvertisements,
            maxPhotos: entity.maxPhotos,
            discount: entity.discount,
            oldPrice: entity.oldPrice,
        });
        return model;
    }

    static toMongoose(plan: Plan) {
        return {
            name: plan.name,
            freeTrialDays: plan.freeTrialDays,
            items: plan.items,
            price: plan.price,
            externalId: plan.externalId,
            maxAdvertisements: plan.maxAdvertisements,
            maxPhotos: plan.maxPhotos,
            discount: plan.discount,
            oldPrice: plan.oldPrice,
        }
    }
}
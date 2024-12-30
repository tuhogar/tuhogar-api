import { Plan } from 'src/domain/entities/plan';
import { Plan as PlanDocument } from '../entities/plan.entity';

export class MongoosePlanMapper {
    
    static toDomain(entity: PlanDocument): Plan {
        if (!entity) return null;
        
        const model = new Plan({
            id: entity._id.toString(),
            name: entity.name,
            duration: entity.duration,
            items: entity.items,
            price: entity.price,
            photo: entity.photo,
            externalId: entity.externalId,
        });
        return model;
    }

    static toMongoose(plan: Plan) {
        return {
            name: plan.name,
            duration: plan.duration,
            items: plan.items,
            price: plan.price,
            externalId: plan.externalId,
        }
    }
}
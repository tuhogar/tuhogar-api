import { Plan } from 'src/domain/entities/plan';
import { Plan as PlanDocument } from '../entities/plan.entity';
import * as mongoose from 'mongoose';

export class MongoosePlanMapper {
    
    static toDomain(entity: PlanDocument): Plan {
        if (!entity) return null;
        
        const model = new Plan({
            _id: (entity._id as unknown as mongoose.Types.ObjectId).toString(),
            name: entity.name,
            duration: entity.duration,
            items: entity.items,
            price: entity.price,
        });
        return model;
    }

    static toMongoose(plan: Plan) {
        return {
            name: plan.name,
            duration: plan.duration,
            items: plan.items,
            price: plan.price,
        }
    }
}
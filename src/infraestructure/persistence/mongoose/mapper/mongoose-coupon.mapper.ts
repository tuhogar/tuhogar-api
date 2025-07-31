import { Coupon, CouponType } from 'src/domain/entities/coupon';
import { Coupon as CouponDocument } from '../entities/coupon.entity';
import { MongoosePlanMapper } from './mongoose-plan.mapper';
import { Plan as PlanDocument } from '../entities/plan.entity';
import * as mongoose from 'mongoose';

export class MongooseCouponMapper {
    
    static toDomain(entity: CouponDocument): Coupon {
        if (!entity) return null;
        
        const model = new Coupon({
            id: entity._id.toString(),
            coupon: entity.coupon,
            type: entity.type as CouponType,
            isSingleRedemption: entity.isSingleRedemption,
            doesNotHavePaidPlanIds: !!entity.doesNotHavePaidPlanIds ? entity.doesNotHavePaidPlanIds.map((a) => MongoosePlanMapper.toDomain(a)) : undefined,
            hasPaidPlanIds: !!entity.hasPaidPlanIds ? entity.hasPaidPlanIds.map((a) => MongoosePlanMapper.toDomain(a)) : undefined,
            expirationDate: entity.expirationDate,
            isRedeemed: entity.isRedeemed,
            allowRepeatedFulfillment: entity.allowRepeatedFulfillment,
        });
        return model;
    }
    
    static toMongoose(entity: Coupon): Partial<CouponDocument> {
        if (!entity) return null;
        
        return {
            coupon: entity.coupon,
            type: entity.type,
            isSingleRedemption: entity.isSingleRedemption,
            // Convert domain Plan objects to Mongoose ObjectId references
            doesNotHavePaidPlanIds: entity.doesNotHavePaidPlanIds ? 
                entity.doesNotHavePaidPlanIds.map(plan => 
                    new mongoose.Types.ObjectId(plan.id)
                ) as unknown as PlanDocument[] : 
                undefined,
            hasPaidPlanIds: entity.hasPaidPlanIds ? 
                entity.hasPaidPlanIds.map(plan => 
                    new mongoose.Types.ObjectId(plan.id)
                ) as unknown as PlanDocument[] : 
                undefined,
            expirationDate: entity.expirationDate,
            isRedeemed: entity.isRedeemed,
            allowRepeatedFulfillment: entity.allowRepeatedFulfillment,
        };
    }
}
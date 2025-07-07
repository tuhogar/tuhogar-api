import { Coupon, CouponType } from 'src/domain/entities/coupon';
import { Coupon as CouponDocument } from '../entities/coupon.entity';
import { MongoosePlanMapper } from './mongoose-plan.mapper';

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
}
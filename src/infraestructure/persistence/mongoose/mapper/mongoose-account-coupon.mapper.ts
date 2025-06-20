import { AccountCoupon } from 'src/domain/entities/account-coupon';
import { AccountCoupon as AccountCouponDocument } from '../entities/account-coupon.entity';
import { MongooseCouponMapper } from './mongoose-coupon.mapper';

export class MongooseAccountCouponMapper {
    
    static toDomain(entity: AccountCouponDocument): AccountCoupon {
        if (!entity) return null;
        
        const model = new AccountCoupon({
            id: entity._id.toString(),
            accountId: entity.accountId?.toString(),
            couponId: entity.couponId?.toString(),
            used: entity.used,
            coupon: entity.couponId?.createdAt ? MongooseCouponMapper.toDomain(entity.couponId) : undefined,
        });
        return model;
    }

    static toMongoose(accountCoupon: AccountCoupon) {
        return {
            accountId: accountCoupon.accountId,
            couponId: accountCoupon.couponId,
            used: accountCoupon.used,
        }
    }
}
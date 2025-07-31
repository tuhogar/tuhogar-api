import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Coupon as CouponMongoose } from "../entities/coupon.entity"
import { Coupon } from "src/domain/entities/coupon";
import { ICouponRepository } from "src/application/interfaces/repositories/coupon.repository.interface";
import { MongooseCouponMapper } from "../mapper/mongoose-coupon.mapper";

export class MongooseCouponRepository implements ICouponRepository {
    constructor(
        @InjectModel(CouponMongoose.name) private readonly couponModel: Model<CouponMongoose>,
    ) {}
    
    async findOneByCoupon(coupon: string): Promise<Coupon> {
        const query = await this.couponModel.findOne({ coupon }).exec();
        return MongooseCouponMapper.toDomain(query);
    }

    async redeem(id: string): Promise<void> {
        await this.couponModel.updateOne({ _id: id, isSingleRedemption: true, isRedeemed: false }, { isRedeemed: true }).exec();
    }

    async create(coupon: Coupon): Promise<Coupon> {
        const data = MongooseCouponMapper.toMongoose(coupon);
        const entity = new this.couponModel({ ...data });
        await entity.save();

        return MongooseCouponMapper.toDomain(entity);
    }
}
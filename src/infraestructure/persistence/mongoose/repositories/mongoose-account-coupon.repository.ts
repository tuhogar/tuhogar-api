import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AccountCoupon as AccountCouponMongoose } from "../entities/account-coupon.entity"
import { AccountCoupon } from "src/domain/entities/account-coupon";
import { IAccountCouponRepository } from "src/application/interfaces/repositories/account-coupon.repository.interface";
import { MongooseAccountCouponMapper } from "../mapper/mongoose-account-coupon.mapper";

export class MongooseAccountCouponRepository implements IAccountCouponRepository {
    constructor(
        @InjectModel(AccountCouponMongoose.name) private readonly accountCouponModel: Model<AccountCouponMongoose>,
    ) {}
    
    async create(accountCoupon: AccountCoupon): Promise<AccountCoupon> {
        const data = MongooseAccountCouponMapper.toMongoose(accountCoupon);
        const entity = new this.accountCouponModel({ ...data });
        await entity.save();

        return MongooseAccountCouponMapper.toDomain(entity);
    }

    async findLastNotusedByAccountId(accountId: string): Promise<AccountCoupon> {
        const entity = await this.accountCouponModel.findOne({ accountId, used: false }).populate('couponId').sort({ createdAt: -1 }).exec();
        return MongooseAccountCouponMapper.toDomain(entity);
    }

    async use(accountCouponId: string): Promise<void> {
        await this.accountCouponModel.updateOne({ _id: accountCouponId }, { used: true }).exec();
    }
}
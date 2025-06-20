import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Account } from './account.entity';
import { Coupon } from './coupon.entity';

@Schema({ timestamps: true, collection: 'account-coupons' })
export class AccountCoupon {
    _id: mongoose.Schema.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Account' })
    accountId: Account;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Coupon' })
    couponId: Coupon;

    @Prop()
    used: boolean;
}

const AccountCouponSchema = SchemaFactory.createForClass(AccountCoupon);

export { AccountCouponSchema };
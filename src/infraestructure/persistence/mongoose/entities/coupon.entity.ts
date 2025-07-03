import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Plan } from './plan.entity';

@Schema({ timestamps: true, collection: 'coupons' })
export class Coupon {
    _id: mongoose.Schema.Types.ObjectId;

    @Prop()
    coupon: string;

    @Prop()
    type: string;

    @Prop()
    isSingleRedemption: boolean;

    @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Plan' }])
    doesNotHavePaidPlanIds: Plan[];

    @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Plan' }])
    hasPaidPlanIds: Plan[];

    @Prop()
    expirationDate: Date

    @Prop()
    isRedeemed: boolean;

    @Prop()
    allowRepeatedFulfillment: boolean;

    @Prop()
    createdAt: Date;
}

const CouponSchema = SchemaFactory.createForClass(Coupon);

export { CouponSchema };
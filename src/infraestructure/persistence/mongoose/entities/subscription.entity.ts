import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Plan } from './plan.entity';
import { Account } from './account.entity';

@Schema({ timestamps: true, collection: 'subscriptions' })
export class Subscription {
    _id: mongoose.Schema.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Account' })
    accountId: Account;
    
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Plan' })
    planId: Plan;

    @Prop({ index: true })
    externalId: string;

    @Prop()
    status: string;

    @Prop({ index: true })
    externalPayerReference: string;

    @Prop()
    createdAt: Date

    @Prop()
    updatedAt: Date
}

const SubscriptionSchema = SchemaFactory.createForClass(Subscription);

export { SubscriptionSchema };
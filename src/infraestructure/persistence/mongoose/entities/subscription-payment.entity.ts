import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Subscription } from './subscription.entity';
import { Account } from './account.entity';

@Schema({ timestamps: true, collection: 'subscription-payments' })
export class SubscriptionPayment {
    _id: mongoose.Schema.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Account' })
    accountId: Account;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' })
    subscriptionId: Subscription;
    
    @Prop({ index: true })
    externalId: string;

    @Prop({ index: true })
    externalSubscriptionReference: string;

    @Prop()
    paymentAt: Date;

    @Prop()
    approvedAt: Date;

    @Prop()
    public type: string;
    
    @Prop()
    public method: string;
    
    @Prop()
    public description: string;
    
    @Prop()
    public amount: number;
    
    @Prop()
    public currency: string;
    
    @Prop()
    status: string;

    @Prop()
    public statusDescription: string;
}

const SubscriptionPaymentSchema = SchemaFactory.createForClass(SubscriptionPayment);

export { SubscriptionPaymentSchema };
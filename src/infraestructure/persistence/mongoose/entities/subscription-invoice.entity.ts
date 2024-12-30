import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Subscription } from './subscription.entity';
import { Account } from './account.entity';

@Schema({ timestamps: true, collection: 'subscription-invoices' })
export class SubscriptionInvoice {
    _id: mongoose.Schema.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Account' })
    accountId: Account;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' })
    subscriptionId: Subscription;
    
    @Prop()
    externalId: string;

    @Prop()
    externalSubscriptionReference: string;

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

const SubscriptionInvoiceSchema = SchemaFactory.createForClass(SubscriptionInvoice);

SubscriptionInvoiceSchema.index({ externalId: -1 });

export { SubscriptionInvoiceSchema };
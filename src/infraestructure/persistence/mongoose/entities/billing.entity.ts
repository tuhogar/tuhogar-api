import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Account } from './account.entity';

@Schema({ timestamps: true, collection: 'billings' })
export class Billing {
    _id: mongoose.Schema.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Account' })
    accountId: Account;

    @Prop()
    name: string;

    @Prop()
    email: string;

    @Prop()
    phone: string;

    @Prop()
    address: string;

    @Prop()
    documentType: string;

    @Prop()
    documentNumber: string;

    @Prop()
    createdAt: Date

    @Prop()
    updatedAt: Date
}


const BillingSchema = SchemaFactory.createForClass(Billing);

BillingSchema.index({ accountId: -1 });

export { BillingSchema };
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Account } from './account.entity';

@Schema({ timestamps: true, collection: 'account-events' })
export class AccountEvent {
    _id: mongoose.Schema.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Account' })
    accountId: Account;

    @Prop()
    type: string;

    @Prop()
    count: number
}

const AccountEventSchema = SchemaFactory.createForClass(AccountEvent);

AccountEventSchema.index({ accountId: -1 });

export { AccountEventSchema };
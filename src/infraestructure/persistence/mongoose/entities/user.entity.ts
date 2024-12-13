import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Advertisement } from './advertisement.entity';
import { Account } from './account.entity';

@Schema({ timestamps: true, collection: 'users' })
export class User {
    _id: mongoose.Schema.Types.ObjectId;

    @Prop()
    name: string;

    @Prop()
    email: string;

    @Prop({ type: String, unique: true })
    uid: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Account' })
    accountId: Account;

    @Prop()
    userRole: string;

    @Prop()
    status: string;

    @Prop()
    phone: string;

    @Prop()
    whatsApp: string;

    @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Advertisement' }])
    advertisementFavorites: Advertisement[];
};

const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ accountId: -1 });

export { UserSchema };
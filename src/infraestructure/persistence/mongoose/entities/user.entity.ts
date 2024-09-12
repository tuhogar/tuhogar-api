import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

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
    accountId: mongoose.Schema.Types.ObjectId;

    @Prop()
    userRole: string;

    @Prop()
    status: String;

    @Prop()
    phone: String;

    @Prop()
    whatsApp: String;

    @Prop([{ type: mongoose.Schema.Types.ObjectId, ref: 'Advertisement' }])
    advertisementFavorites: [mongoose.Schema.Types.ObjectId];
};

const UserSchema = SchemaFactory.createForClass(User);

export { UserSchema };
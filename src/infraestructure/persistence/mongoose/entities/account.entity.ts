import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema({ timestamps: true, collection: 'accounts' })
export class Account {
    _id: mongoose.Schema.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Plan' })
    planId: mongoose.Schema.Types.ObjectId;

    @Prop()
    photo: String;

    @Prop()
    name: String;

    @Prop()
    email: String;

    @Prop()
    documentType: String;

    @Prop()
    documentNumber: String;

    @Prop()
    address: Object;
    
    @Prop()
    phone: String;

    @Prop()
    whatsApp: String;

    @Prop()
    webSite: String;

    @Prop()
    socialMedia: Object;

    @Prop()
    description: String;

    @Prop()
    status: String;
}


const AccountSchema = SchemaFactory.createForClass(Account);

export { AccountSchema }
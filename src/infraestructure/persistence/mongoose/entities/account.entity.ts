import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema({ timestamps: true, collection: 'accounts' })
export class Account {
    _id: mongoose.Schema.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Plan' })
    planId: mongoose.Schema.Types.ObjectId;

    @Prop()
    photo: string;

    @Prop()
    name: string;

    @Prop()
    email: string;

    @Prop()
    documentType: string;

    @Prop()
    documentNumber: string;

    @Prop()
    address: Object;
    
    @Prop()
    phone: string;

    @Prop()
    whatsApp: string;

    @Prop()
    webSite: string;

    @Prop()
    socialMedia: Object;

    @Prop()
    description: string;

    @Prop()
    status: string;
}


const AccountSchema = SchemaFactory.createForClass(Account);

export { AccountSchema };
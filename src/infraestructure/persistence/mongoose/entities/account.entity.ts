import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Plan } from './plan.entity';

@Schema({ timestamps: true, collection: 'accounts' })
export class Account {
    _id: mongoose.Schema.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Plan' })
    planId: Plan;

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

    @Prop({ type: Object })
    address: Object;
    
    @Prop()
    phone: string;

    @Prop()
    whatsApp: string;

    @Prop()
    webSite: string;

    @Prop({ type: Object })
    socialMedia: Object;

    @Prop()
    description: string;

    @Prop()
    status: string;

    @Prop()
    createdAt: Date

    @Prop()
    updatedAt: Date
}


const AccountSchema = SchemaFactory.createForClass(Account);

export { AccountSchema };
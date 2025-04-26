import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema({ timestamps: true, collection: 'plans' })
export class Plan {
    _id: mongoose.Schema.Types.ObjectId;

    @Prop()
    name: string;

    @Prop()
    duration: number;

    @Prop({ type: [String] })
    items: string[];

    @Prop()
    price: number;

    @Prop()
    photo: string;

    @Prop()
    externalId: string;

    @Prop()
    maxAdvertisements: number;

    @Prop()
    maxPhotos: number;
}

const PlanSchema = SchemaFactory.createForClass(Plan);

export { PlanSchema };
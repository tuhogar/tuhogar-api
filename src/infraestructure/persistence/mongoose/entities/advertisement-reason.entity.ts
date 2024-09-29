import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema({ timestamps: true, collection: 'advertisement-reasons' })
export class AdvertisementReason {
    _id: mongoose.Schema.Types.ObjectId;

    @Prop()
    name: string;
}

const AdvertisementReasonSchema = SchemaFactory.createForClass(AdvertisementReason);

export { AdvertisementReasonSchema };
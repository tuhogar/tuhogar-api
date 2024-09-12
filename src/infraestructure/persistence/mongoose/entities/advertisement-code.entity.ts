import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema({ timestamps: true, collection: 'advertisement-codes' })
export class AdvertisementCode {
    _id: mongoose.Schema.Types.ObjectId;

    @Prop()
    code: { type: Number, required: true };
}

const AdvertisementCodeSchema = SchemaFactory.createForClass(AdvertisementCode);

export { AdvertisementCodeSchema };
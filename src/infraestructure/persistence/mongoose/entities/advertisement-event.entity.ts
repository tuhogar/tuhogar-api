import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Advertisement } from './advertisement.entity';

@Schema({ timestamps: true, collection: 'advertisement-events' })
export class AdvertisementEvent {
    _id: mongoose.Schema.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Advertisement' })
    advertisementId: Advertisement;

    @Prop()
    type: string;

    @Prop()
    count: number
}

const AdvertisementEventSchema = SchemaFactory.createForClass(AdvertisementEvent);

export { AdvertisementEventSchema };
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema({ timestamps: true, collection: 'advertisement-reports' })
export class AdvertisementReport {
    _id: mongoose.Schema.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Advertisement' })
    advertisementId: mongoose.Schema.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'AdvertisementReason' })
    advertisementReasonId: mongoose.Schema.Types.ObjectId;
}

const AdvertisementReportSchema = SchemaFactory.createForClass(AdvertisementReport);

export { AdvertisementReportSchema };
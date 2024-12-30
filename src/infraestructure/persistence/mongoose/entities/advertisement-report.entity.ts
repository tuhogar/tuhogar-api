import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { AdvertisementReason } from './advertisement-reason.entity';
import { Advertisement } from './advertisement.entity';

@Schema({ timestamps: true, collection: 'advertisement-reports' })
export class AdvertisementReport {
    _id: mongoose.Schema.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Advertisement' })
    advertisementId: Advertisement;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'AdvertisementReason' })
    advertisementReasonId: AdvertisementReason;
}

const AdvertisementReportSchema = SchemaFactory.createForClass(AdvertisementReport);

AdvertisementReportSchema.index({ advertisementId: -1 });

export { AdvertisementReportSchema };
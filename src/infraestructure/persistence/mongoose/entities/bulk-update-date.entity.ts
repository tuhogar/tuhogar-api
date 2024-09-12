import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema({ timestamps: { createdAt: false, updatedAt: true }, collection: 'bulk-update-date' })
export class BulkUpdateDate {
    _id: mongoose.Schema.Types.ObjectId;
};

const BulkUpdateDateSchema = SchemaFactory.createForClass(BulkUpdateDate);

export { BulkUpdateDateSchema };
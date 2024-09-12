import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema({ timestamps: true, collection: 'amenities' })
export class Amenity {
    _id: mongoose.Schema.Types.ObjectId;

    @Prop()
    key: String;

    @Prop()
    name: String;
}

const AmenitySchema = SchemaFactory.createForClass(Amenity);

export { AmenitySchema };
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema({ timestamps: true, collection: 'amenities' })
export class Amenity {
    _id: mongoose.Schema.Types.ObjectId;

    @Prop()
    key: string;

    @Prop()
    name: string;

    @Prop()
    phosphorIcon: string;

    @Prop()
    type: string[];
}

const AmenitySchema = SchemaFactory.createForClass(Amenity);

export { AmenitySchema };
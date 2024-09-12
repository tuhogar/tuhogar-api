import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema({ timestamps: true, collection: 'plans' })
export class Plan {
    _id: mongoose.Schema.Types.ObjectId;

    @Prop()
    name: String;

    @Prop()
    description: String;

    @Prop()
    price: Number;
}

const PlanSchema = SchemaFactory.createForClass(Plan);

export { PlanSchema };
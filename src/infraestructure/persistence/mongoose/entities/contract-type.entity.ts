import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema({ timestamps: true, collection: 'contract-types' })
export class ContractType {
    _id: mongoose.Schema.Types.ObjectId;

    @Prop()
    key: string;

    @Prop()
    name: string;
}

const ContractTypeSchema = SchemaFactory.createForClass(ContractType);

export { ContractTypeSchema };
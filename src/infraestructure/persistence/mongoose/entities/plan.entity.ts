import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema({ timestamps: true, collection: 'plans' })
export class Plan {
    _id: mongoose.Schema.Types.ObjectId;

    @Prop()
    name: string;

    /**
     * Número de dias gratuitos no período de teste da assinatura
     * Opcional: se não for fornecido, o plano não terá período gratuito
     */
    @Prop({ required: false })
    freeTrialDays?: number;

    @Prop({ type: [String] })
    items: string[];

    @Prop()
    price: number;

    @Prop()
    photo: string;

    @Prop()
    externalId: string;

    @Prop()
    maxAdvertisements: number;

    @Prop()
    maxPhotos: number;

    @Prop()
    discount?: number;

    @Prop()
    oldPrice?: number;

    @Prop()
    createdAt: Date
}

const PlanSchema = SchemaFactory.createForClass(Plan);

export { PlanSchema };
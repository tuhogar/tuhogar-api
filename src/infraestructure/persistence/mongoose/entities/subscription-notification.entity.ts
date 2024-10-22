import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema({ timestamps: true, collection: 'subscription-notifications' })
export class SubscriptionNotification {
    _id: mongoose.Schema.Types.ObjectId;

    @Prop()
    type: string;

    @Prop()
    externalId: string;

    @Prop()
    action: string;

    @Prop({ type: mongoose.Schema.Types.Mixed })
    payload: Record<string, any>;

    @Prop({ type: mongoose.Schema.Types.Mixed })
    subscription: Record<string, any>;

    @Prop({ type: mongoose.Schema.Types.Mixed })
    payment: Record<string, any>;

    @Prop({ type: mongoose.Schema.Types.Mixed })
    invoice: Record<string, any>;
}

const SubscriptionNotificationSchema = SchemaFactory.createForClass(SubscriptionNotification);

export { SubscriptionNotificationSchema };
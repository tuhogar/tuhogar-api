import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Subscription } from './subscription.entity';
import { Account } from './account.entity';

@Schema({ timestamps: true, collection: 'subscription-payments' })
export class SubscriptionPayment {
    _id: mongoose.Schema.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Account' })
    accountId: Account;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' })
    subscriptionId: Subscription;
    
    @Prop()
    externalId: string;

    @Prop()
    externalSubscriptionReference: string;

    @Prop()
    externalPayerReference: string;

    @Prop()
    public type: string;
    
    @Prop()
    public method: string;
    
    @Prop()
    public description: string;
    
    @Prop()
    public amount: number;
    
    @Prop()
    public currency: string;
    
    @Prop()
    status: string;

    @Prop()
    public statusDescription: string;
    
    /**
     * Data em que o pagamento foi realizado
     * Obtida a partir do campo x_transaction_date do gateway de pagamento
     */
    @Prop()
    public paymentDate: Date;
}

const SubscriptionPaymentSchema = SchemaFactory.createForClass(SubscriptionPayment);

SubscriptionPaymentSchema.index({ accountId: -1 });
SubscriptionPaymentSchema.index({ externalId: -1 });

export { SubscriptionPaymentSchema };
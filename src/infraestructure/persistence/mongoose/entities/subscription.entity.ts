import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Plan } from './plan.entity';
import { Account } from './account.entity';

@Schema({ timestamps: true, collection: 'subscriptions' })
export class Subscription {
    _id: mongoose.Schema.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Account' })
    accountId: Account;
    
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Plan' })
    planId: Plan;

    @Prop()
    externalId: string;

    @Prop()
    status: string;

    @Prop()
    externalPayerReference: string;

    @Prop({ type: mongoose.Schema.Types.Mixed })
    resultIntegration: Record<string, any>;

    /**
     * Data efetiva de cancelamento da assinatura
     * Utilizada quando o status é CANCELLED_ON_PAYMENT_GATEWAY para determinar
     * quando a assinatura deve ser efetivamente cancelada (status CANCELLED)
     * Geralmente definida como 30 dias após a data de cancelamento no gateway
     */
    @Prop()
    effectiveCancellationDate: Date;

    /**
     * Data do último pagamento realizado para esta assinatura
     * Atualizada quando um pagamento é aprovado
     */
    @Prop()
    paymentDate: Date;

    /**
     * Data prevista para o próximo pagamento da assinatura
     * Calculada como paymentDate + 30 dias quando um pagamento é aprovado
     * Ou como data atual + 30 dias quando a assinatura é criada
     */
    @Prop()
    nextPaymentDate: Date;

    @Prop()
    createdAt: Date

    @Prop()
    updatedAt: Date
}

const SubscriptionSchema = SchemaFactory.createForClass(Subscription);

SubscriptionSchema.index({ accountId: -1 });
SubscriptionSchema.index({ externalId: -1 });
SubscriptionSchema.index({ externalPayerReference: -1 });

// Índice para a data efetiva de cancelamento
SubscriptionSchema.index({ effectiveCancellationDate: 1 });

// Índice composto para status e data efetiva de cancelamento
// Otimiza consultas para buscar assinaturas com status CANCELLED_ON_PAYMENT_GATEWAY
// e effectiveCancellationDate <= data atual
SubscriptionSchema.index({ status: 1, effectiveCancellationDate: 1 });

export { SubscriptionSchema };
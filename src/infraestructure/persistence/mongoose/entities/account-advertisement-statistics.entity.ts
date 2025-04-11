import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Account } from './account.entity';

@Schema({ timestamps: true, collection: 'account-advertisement-statistics' })
export class AccountAdvertisementStatistics {
    _id: mongoose.Schema.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Account' })
    accountId: Account;

    @Prop()
    month: string;

    @Prop()
    createdAt: Date;

    @Prop({ type: Object })
    totalAdvertisements: {
        total: number;
        byTransactionType: {
            sale: number;
            rent: number;
        };
        byPropertyTypeAndTransaction: {
            house: { sale: number; rent: number };
            apartment: { sale: number; rent: number };
            lot: { sale: number; rent: number };
        };
    };

    @Prop({ type: Object })
    totalVisits: {
        total: number;
        byTransactionType: {
            sale: number;
            rent: number;
        };
        byPropertyTypeAndTransaction: {
            house: { sale: number; rent: number };
            apartment: { sale: number; rent: number };
            lot: { sale: number; rent: number };
        };
    };

    @Prop({ type: Object })
    phoneClicks: {
        total: number;
        byTransactionType: {
            sale: number;
            rent: number;
        };
        byPropertyTypeAndTransaction: {
            house: { sale: number; rent: number };
            apartment: { sale: number; rent: number };
            lot: { sale: number; rent: number };
        };
    };

    @Prop()
    digitalCatalogViews: number;

    @Prop({ type: Object })
    contactInfoClicks: {
        total: number;
        byTransactionType: {
            sale: number;
            rent: number;
        };
        byPropertyTypeAndTransaction: {
            house: { sale: number; rent: number };
            apartment: { sale: number; rent: number };
            lot: { sale: number; rent: number };
        };
    };

    @Prop({ type: Object })
    topViewedAdvertisements: {
        sale: Array<{ advertisementId: string; views: number }>;
        rent: Array<{ advertisementId: string; views: number }>;
    };

    @Prop({ type: Object })
    topInteractedAdvertisements: {
        sale: Array<{ advertisementId: string; interactions: number }>;
        rent: Array<{ advertisementId: string; interactions: number }>;
    };
}

const AccountAdvertisementStatisticsSchema = SchemaFactory.createForClass(AccountAdvertisementStatistics);

// Índices para melhorar a performance das consultas
AccountAdvertisementStatisticsSchema.index({ accountId: 1, month: 1 }, { unique: true });
AccountAdvertisementStatisticsSchema.index({ month: 1 });

export { AccountAdvertisementStatisticsSchema };

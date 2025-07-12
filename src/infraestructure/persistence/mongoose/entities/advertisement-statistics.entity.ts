import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema({ timestamps: true, collection: 'advertisement-statistics' })
export class AdvertisementStatistics {
    _id: mongoose.Schema.Types.ObjectId;

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
    
    @Prop({ type: Object })
    accumulatedMetrics: {
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
        digitalCatalogViews: number;
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

const AdvertisementStatisticsSchema = SchemaFactory.createForClass(AdvertisementStatistics);

// Índices para melhorar a performance das consultas
AdvertisementStatisticsSchema.index({ month: 1 }, { unique: true });

export { AdvertisementStatisticsSchema };

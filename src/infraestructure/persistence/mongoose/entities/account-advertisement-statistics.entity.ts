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
      building: { sale: number; rent: number };
      warehouse: { sale: number; rent: number };
      office: { sale: number; rent: number };
      commercial: { sale: number; rent: number };
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
      building: { sale: number; rent: number };
      warehouse: { sale: number; rent: number };
      office: { sale: number; rent: number };
      commercial: { sale: number; rent: number };
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
      building: { sale: number; rent: number };
      warehouse: { sale: number; rent: number };
      office: { sale: number; rent: number };
      commercial: { sale: number; rent: number };
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
      building: { sale: number; rent: number };
      warehouse: { sale: number; rent: number };
      office: { sale: number; rent: number };
      commercial: { sale: number; rent: number };
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
        building: { sale: number; rent: number };
        warehouse: { sale: number; rent: number };
        office: { sale: number; rent: number };
        commercial: { sale: number; rent: number };
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
        building: { sale: number; rent: number };
        warehouse: { sale: number; rent: number };
        office: { sale: number; rent: number };
        commercial: { sale: number; rent: number };
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
        building: { sale: number; rent: number };
        warehouse: { sale: number; rent: number };
        office: { sale: number; rent: number };
        commercial: { sale: number; rent: number };
      };
    };
    dashboard?: {
      catalogViews: {
        byTransactionType: { sale: number; rent: number };
        byPropertyType: {
          house: number;
          apartment: number;
          lot: number;
          building: number;
          warehouse: number;
          office: number;
          commercial: number;
        };
      };
      views: {
        byCityAndTransaction: Record<string, { sale: number; rent: number }>;
        bySectorAndTransaction: Record<string, { sale: number; rent: number }>;
      };
      interactions: {
        byCityAndTransaction: Record<string, { sale: number; rent: number }>;
        bySectorAndTransaction: Record<string, { sale: number; rent: number }>;
      };
    };
  };

  @Prop({ type: Object })
  dashboard: {
    summary: {
      totalProperties: number;
      activeProperties: number;
      totalAdViews: number;
      totalAdWhatsappClicks: number;
      totalAdPhoneClicks: number;
      totalAdCatalogViews: number;
    };
    breakdowns: {
      byTransactionType: Array<{
        key: string;
        label: string;
        totals: {
          properties: number;
          activeProperties: number;
          views: number;
          whatsappClicks: number;
          phoneClicks: number;
          catalogViews: number;
        };
      }>;
      byPropertyType: Array<{
        key: string;
        label: string;
        totals: {
          properties: number;
          activeProperties: number;
          views: number;
          whatsappClicks: number;
          phoneClicks: number;
          catalogViews: number;
        };
      }>;
      byPropertyTypeAndTransactionType: Array<{
        key: string;
        label: string;
        totals: { rentProperties: number; saleProperties: number };
      }>;
    };
    viewsBreakdowns: {
      byTransactionType: Array<{
        key: string;
        label: string;
        totals: { value: number };
      }>;
      byPropertyType: Array<{
        key: string;
        label: string;
        totals: { value: number };
      }>;
      byPropertyTypeAndTransactionType: Array<{
        key: string;
        label: string;
        totals: { rentValue: number; saleValue: number };
      }>;
      byCities: Array<{
        key: string;
        label: string;
        totals: { rentValue: number; saleValue: number };
      }>;
      bySectors: Array<{
        key: string;
        label: string;
        totals: { rentValue: number; saleValue: number };
      }>;
    };
    interactionsBreakdowns: {
      byTransactionType: Array<{
        key: string;
        label: string;
        totals: { value: number };
      }>;
      byPropertyType: Array<{
        key: string;
        label: string;
        totals: { value: number };
      }>;
      byPropertyTypeAndTransactionType: Array<{
        key: string;
        label: string;
        totals: { rentValue: number; saleValue: number };
      }>;
      byCities: Array<{
        key: string;
        label: string;
        totals: { rentValue: number; saleValue: number };
      }>;
      bySectors: Array<{
        key: string;
        label: string;
        totals: { rentValue: number; saleValue: number };
      }>;
    };
  };
}

const AccountAdvertisementStatisticsSchema = SchemaFactory.createForClass(
  AccountAdvertisementStatistics,
);

// Índices para melhorar a performance das consultas
AccountAdvertisementStatisticsSchema.index(
  { accountId: 1, month: 1 },
  { unique: true },
);
AccountAdvertisementStatisticsSchema.index({ month: 1 });

export { AccountAdvertisementStatisticsSchema };

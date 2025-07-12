import { Document } from 'mongoose';
import { Advertisement } from './advertisement';
import {
  AdvertisementMetric,
  ContactInfoClicks,
  MetricBase,
  PhoneClicks,
  PropertyTypeAndTransactionMetrics,
  TopAdvertisements,
  TotalAdvertisements,
  TotalVisits,
  TransactionTypeMetrics
} from './account-advertisement-statistics';

/**
 * Interface para métricas acumuladas detalhadas
 */
export interface AccumulatedMetricsDetailed {
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
}

export class AdvertisementStatistics {
  id?: string;
  month: string;
  createdAt: Date;
  totalAdvertisements: TotalAdvertisements;
  totalVisits: TotalVisits;
  phoneClicks: PhoneClicks;
  digitalCatalogViews: number;
  contactInfoClicks: ContactInfoClicks;
  topViewedAdvertisements: TopAdvertisements;
  topInteractedAdvertisements: TopAdvertisements;
  accumulatedMetrics?: AccumulatedMetricsDetailed;

  constructor(props: Partial<AdvertisementStatistics>) {
    this.id = props.id;
    this.month = props.month;
    this.createdAt = props.createdAt || new Date(Date.UTC(
      new Date().getUTCFullYear(),
      new Date().getUTCMonth(),
      new Date().getUTCDate(),
      new Date().getUTCHours(),
      new Date().getUTCMinutes(),
      new Date().getUTCSeconds(),
      new Date().getUTCMilliseconds()
    ));
    this.digitalCatalogViews = props.digitalCatalogViews || 0;
    this.accumulatedMetrics = props.accumulatedMetrics;
    
    if (props.totalAdvertisements) {
      this.totalAdvertisements = new TotalAdvertisements(props.totalAdvertisements);
    }
    
    if (props.totalVisits) {
      this.totalVisits = new TotalVisits(props.totalVisits);
    }
    
    if (props.phoneClicks) {
      this.phoneClicks = new PhoneClicks(props.phoneClicks);
    }
    
    if (props.contactInfoClicks) {
      this.contactInfoClicks = new ContactInfoClicks(props.contactInfoClicks);
    }
    
    if (props.topViewedAdvertisements) {
      this.topViewedAdvertisements = new TopAdvertisements(props.topViewedAdvertisements);
    }
    
    if (props.topInteractedAdvertisements) {
      this.topInteractedAdvertisements = new TopAdvertisements(props.topInteractedAdvertisements);
    }
  }
}

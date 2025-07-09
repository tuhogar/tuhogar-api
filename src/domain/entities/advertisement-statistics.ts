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

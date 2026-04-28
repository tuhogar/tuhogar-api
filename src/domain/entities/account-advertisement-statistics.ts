import { Document } from 'mongoose';
import { Advertisement } from './advertisement';

export class TransactionTypeMetrics {
  sale: number;
  rent: number;

  constructor(props: TransactionTypeMetrics) {
    Object.assign(this, props);
  }
}

export class PropertyTypeAndTransactionMetrics {
  house: TransactionTypeMetrics;
  apartment: TransactionTypeMetrics;
  lot: TransactionTypeMetrics;
  building: TransactionTypeMetrics;
  warehouse: TransactionTypeMetrics;
  office: TransactionTypeMetrics;
  commercial: TransactionTypeMetrics;

  constructor(props: PropertyTypeAndTransactionMetrics) {
    this.house = new TransactionTypeMetrics(props.house);
    this.apartment = new TransactionTypeMetrics(props.apartment);
    this.lot = new TransactionTypeMetrics(props.lot);
    this.building = new TransactionTypeMetrics(props.building);
    this.warehouse = new TransactionTypeMetrics(props.warehouse);
    this.office = new TransactionTypeMetrics(props.office);
    this.commercial = new TransactionTypeMetrics(props.commercial);
  }
}

export class MetricBase {
  total: number;
  byTransactionType: TransactionTypeMetrics;
  byPropertyTypeAndTransaction: PropertyTypeAndTransactionMetrics;

  constructor(props: MetricBase) {
    this.total = props.total;
    this.byTransactionType = new TransactionTypeMetrics(
      props.byTransactionType,
    );
    this.byPropertyTypeAndTransaction = new PropertyTypeAndTransactionMetrics(
      props.byPropertyTypeAndTransaction,
    );
  }
}

export class TotalAdvertisements extends MetricBase {
  constructor(props: MetricBase) {
    super(props);
  }
}

export class TotalVisits extends MetricBase {
  constructor(props: MetricBase) {
    super(props);
  }
}

export class PhoneClicks extends MetricBase {
  constructor(props: MetricBase) {
    super(props);
  }
}

export class ContactInfoClicks extends MetricBase {
  constructor(props: MetricBase) {
    super(props);
  }
}

export class AdvertisementMetric {
  advertisementId: string;
  advertisement?: Advertisement;
  views?: number;
  interactions?: number;

  constructor(props: AdvertisementMetric) {
    Object.assign(this, props);
  }
}

export class TopAdvertisements {
  sale: AdvertisementMetric[];
  rent: AdvertisementMetric[];

  constructor(props: TopAdvertisements) {
    this.sale = props.sale.map((item) => new AdvertisementMetric(item));
    this.rent = props.rent.map((item) => new AdvertisementMetric(item));
  }
}

export class DashboardSummary {
  totalProperties: number;
  activeProperties: number;
  totalAdViews: number;
  totalAdWhatsappClicks: number;
  totalAdPhoneClicks: number;
  totalAdCatalogViews: number;

  constructor(props: DashboardSummary) {
    Object.assign(this, props);
  }
}

export class DashboardBreakdownTotals {
  properties: number;
  activeProperties: number;
  views: number;
  whatsappClicks: number;
  phoneClicks: number;
  catalogViews: number;

  constructor(props: DashboardBreakdownTotals) {
    Object.assign(this, props);
  }
}

export class DashboardBreakdownItem {
  key: string;
  label: string;
  totals: DashboardBreakdownTotals;

  constructor(props: DashboardBreakdownItem) {
    this.key = props.key;
    this.label = props.label;
    this.totals = new DashboardBreakdownTotals(props.totals);
  }
}

export class DashboardPropertyTypeByOfferTotals {
  rentProperties: number;
  saleProperties: number;

  constructor(props: DashboardPropertyTypeByOfferTotals) {
    Object.assign(this, props);
  }
}

export class DashboardPropertyTypeByOfferItem {
  key: string;
  label: string;
  totals: DashboardPropertyTypeByOfferTotals;

  constructor(props: DashboardPropertyTypeByOfferItem) {
    this.key = props.key;
    this.label = props.label;
    this.totals = new DashboardPropertyTypeByOfferTotals(props.totals);
  }
}

export class DashboardMetricValueTotals {
  value: number;

  constructor(props: DashboardMetricValueTotals) {
    Object.assign(this, props);
  }
}

export class DashboardMetricItem {
  key: string;
  label: string;
  totals: DashboardMetricValueTotals;

  constructor(props: DashboardMetricItem) {
    this.key = props.key;
    this.label = props.label;
    this.totals = new DashboardMetricValueTotals(props.totals);
  }
}

export class DashboardMetricByOfferTotals {
  rentValue: number;
  saleValue: number;

  constructor(props: DashboardMetricByOfferTotals) {
    Object.assign(this, props);
  }
}

export class DashboardMetricByOfferItem {
  key: string;
  label: string;
  totals: DashboardMetricByOfferTotals;

  constructor(props: DashboardMetricByOfferItem) {
    this.key = props.key;
    this.label = props.label;
    this.totals = new DashboardMetricByOfferTotals(props.totals);
  }
}

export class DashboardBreakdowns {
  byTransactionType: DashboardBreakdownItem[];
  byPropertyType: DashboardBreakdownItem[];
  byPropertyTypeAndTransactionType: DashboardPropertyTypeByOfferItem[];

  constructor(props: DashboardBreakdowns) {
    this.byTransactionType = (props.byTransactionType || []).map(
      (item) => new DashboardBreakdownItem(item),
    );
    this.byPropertyType = (props.byPropertyType || []).map(
      (item) => new DashboardBreakdownItem(item),
    );
    this.byPropertyTypeAndTransactionType = (
      props.byPropertyTypeAndTransactionType || []
    ).map((item) => new DashboardPropertyTypeByOfferItem(item));
  }
}

export class DashboardMetricBreakdowns {
  byTransactionType: DashboardMetricItem[];
  byPropertyType: DashboardMetricItem[];
  byPropertyTypeAndTransactionType: DashboardMetricByOfferItem[];
  byCities: DashboardMetricByOfferItem[];
  bySectors: DashboardMetricByOfferItem[];

  constructor(props: DashboardMetricBreakdowns) {
    this.byTransactionType = (props.byTransactionType || []).map(
      (item) => new DashboardMetricItem(item),
    );
    this.byPropertyType = (props.byPropertyType || []).map(
      (item) => new DashboardMetricItem(item),
    );
    this.byPropertyTypeAndTransactionType = (
      props.byPropertyTypeAndTransactionType || []
    ).map((item) => new DashboardMetricByOfferItem(item));
    this.byCities = (props.byCities || []).map(
      (item) => new DashboardMetricByOfferItem(item),
    );
    this.bySectors = (props.bySectors || []).map(
      (item) => new DashboardMetricByOfferItem(item),
    );
  }
}

export class DashboardData {
  summary: DashboardSummary;
  breakdowns: DashboardBreakdowns;
  viewsBreakdowns: DashboardMetricBreakdowns;
  interactionsBreakdowns: DashboardMetricBreakdowns;

  constructor(props: DashboardData) {
    this.summary = new DashboardSummary(props.summary);
    this.breakdowns = new DashboardBreakdowns(props.breakdowns);
    this.viewsBreakdowns = new DashboardMetricBreakdowns(props.viewsBreakdowns);
    this.interactionsBreakdowns = new DashboardMetricBreakdowns(
      props.interactionsBreakdowns,
    );
  }
}

export interface AccumulatedDashboard {
  catalogViews: {
    byTransactionType: {
      sale: number;
      rent: number;
    };
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
}

export interface AccumulatedMetrics {
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
  dashboard?: AccumulatedDashboard;
}

export class AccountAdvertisementStatistics {
  id?: string;
  accountId: string;
  month: string;
  createdAt: Date;
  totalAdvertisements: TotalAdvertisements;
  totalVisits: TotalVisits;
  phoneClicks: PhoneClicks;
  digitalCatalogViews: number;
  contactInfoClicks: ContactInfoClicks;
  topViewedAdvertisements: TopAdvertisements;
  topInteractedAdvertisements: TopAdvertisements;
  accumulatedMetrics?: AccumulatedMetrics;
  dashboard?: DashboardData;

  constructor(props: Partial<AccountAdvertisementStatistics>) {
    this.id = props.id;
    this.accountId = props.accountId;
    this.month = props.month;
    this.createdAt =
      props.createdAt ||
      new Date(
        Date.UTC(
          new Date().getUTCFullYear(),
          new Date().getUTCMonth(),
          new Date().getUTCDate(),
          new Date().getUTCHours(),
          new Date().getUTCMinutes(),
          new Date().getUTCSeconds(),
          new Date().getUTCMilliseconds(),
        ),
      );
    this.digitalCatalogViews = props.digitalCatalogViews || 0;

    if (props.totalAdvertisements) {
      this.totalAdvertisements = new TotalAdvertisements(
        props.totalAdvertisements,
      );
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
      this.topViewedAdvertisements = new TopAdvertisements(
        props.topViewedAdvertisements,
      );
    }

    if (props.topInteractedAdvertisements) {
      this.topInteractedAdvertisements = new TopAdvertisements(
        props.topInteractedAdvertisements,
      );
    }

    if (props.accumulatedMetrics) {
      this.accumulatedMetrics = props.accumulatedMetrics;
    }

    if (props.dashboard) {
      this.dashboard = new DashboardData(props.dashboard);
    }
  }
}

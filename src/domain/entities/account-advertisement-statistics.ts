import { Document } from 'mongoose';

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

    constructor(props: PropertyTypeAndTransactionMetrics) {
        this.house = new TransactionTypeMetrics(props.house);
        this.apartment = new TransactionTypeMetrics(props.apartment);
        this.lot = new TransactionTypeMetrics(props.lot);
    }
}

export class MetricBase {
    total: number;
    byTransactionType: TransactionTypeMetrics;
    byPropertyTypeAndTransaction: PropertyTypeAndTransactionMetrics;

    constructor(props: MetricBase) {
        this.total = props.total;
        this.byTransactionType = new TransactionTypeMetrics(props.byTransactionType);
        this.byPropertyTypeAndTransaction = new PropertyTypeAndTransactionMetrics(props.byPropertyTypeAndTransaction);
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
        this.sale = props.sale.map(item => new AdvertisementMetric(item));
        this.rent = props.rent.map(item => new AdvertisementMetric(item));
    }
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

    constructor(props: Partial<AccountAdvertisementStatistics>) {
        this.id = props.id;
        this.accountId = props.accountId;
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

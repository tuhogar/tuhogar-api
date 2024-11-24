import { Address } from './address';
import { AdvertisementEvent } from './advertisement-event';
import { Amenity } from './amenity';

export enum AdvertisementActivesOrderBy {
    HIGHEST_PRICE = 'highest_price',
    LOWEST_PRICE = 'lowest_price',
    HIGHEST_PRICE_M2 = 'highest_price_m2',
    LOWEST_PRICE_M2 = 'lowest_price_m2',
}

export enum AdvertisementStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    PAUSED_BY_USER = 'PAUSED_BY_USER',
    PAUSED_BY_APPLICATION = 'PAUSED_BY_APPLICATION',
    WAITING_FOR_APPROVAL = 'WAITING_FOR_APPROVAL',
}

export enum AdvertisementTransactionType {
    RENT = 'RENT',
    SALE = 'SALE',
}

export enum AdvertisementType {
    APARTMENT = 'APARTMENT',
    HOUSE = 'HOUSE',
    BUILDING = 'BUILDING',
    LOT = 'LOT',
    WAREHOUSE = 'WAREHOUSE',
    OFFICE = 'OFFICE',
    COMMERCIAL = 'COMMERCIAL',
}

export enum AdvertisementConstructionType {
    UNDER_CONSTRUCTION = 'UNDER_CONSTRUCTION',
    READY_TO_MOVE = 'READY_TO_MOVE',
}

export class AdvertisementPhoto {
    id?: string;
    name: string;
    url: string;
    thumbnailUrl: string;
    order: number;

    constructor(props: AdvertisementPhoto) {
        Object.assign(this, props);
    }
}

export class Advertisement {
    id?: string;
    accountId: string;
    createdUserId: string;
    updatedUserId: string;
    approvingUserId: string;
    status: AdvertisementStatus;
    code: number;
    transactionType: AdvertisementTransactionType;
    type: AdvertisementType;
    constructionType: AdvertisementConstructionType;
    allContentsIncluded: boolean;
    isResidentialComplex: boolean;
    isPenthouse: boolean;
    bedsCount: number;
    bathsCount: number;
    parkingCount: number;
    floorsCount: number;
    constructionYear: number;
    socioEconomicLevel: number;
    isHoaIncluded: boolean;
    amenities: Amenity[];
    communityAmenities: Amenity[];
    description: string;
    hoaFee: number;
    lotArea: number;
    floorArea: number;
    price: number;
    pricePerFloorArea: number;
    pricePerLotArea: number;
    propertyTax: number;
    address: Address;
    photos: AdvertisementPhoto[];
    tourUrl: string;
    videoUrl: string;
    publishedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    isVacant: boolean;
    vacancyDate: Date;
    externalId: string;
    advertisementEvents: AdvertisementEvent[]

    constructor(props: Advertisement) {
        Object.assign(this, props);
    }
}
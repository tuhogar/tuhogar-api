import { Date, Document } from 'mongoose';
import { Address } from 'src/addresses/intefaces/address.interface';
import { Amenity } from 'src/amenities/interfaces/amenities.interface';

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

export interface AdvertisementPhoto {
    id: string;
    name: string;
    url: string;
    thumbnailUrl: string;
    order: number;
}
export interface Advertisement extends Document  {
    readonly accountId: string;
    readonly createdUserId: string;
    readonly updatedUserId: string;
    readonly approvingUserId: string;
    readonly status: AdvertisementStatus;
    readonly code: number;
    readonly transactionType: AdvertisementTransactionType;
    readonly type: AdvertisementType;
    readonly constructionType: AdvertisementConstructionType;
    readonly allContentsIncluded: boolean;
    readonly isResidentialComplex: boolean;
    readonly isPenthouse: boolean;
    readonly bedsCount: number;
    readonly bathsCount: number;
    readonly parkingCount: number;
    readonly floorsCount: number;
    readonly constructionYear: number;
    readonly socioEconomicLevel: number;
    readonly isHoaIncluded: boolean;
    readonly amenities: Amenity[];
    readonly communityAmenities: Amenity[];
    readonly description: string;
    readonly hoaFee: number;
    readonly lotArea: number;
    readonly floorArea: number;
    readonly price: number;
    readonly pricePerFloorArea: number;
    readonly pricePerLotArea: number;
    readonly propertyTax: number;
    readonly address: Address;
    readonly photos: AdvertisementPhoto[];
    readonly tourUrl: string;
    readonly videoUrl: string;
    readonly publishedAt: Date;
    readonly updatedAt: Date;
    readonly isVacant: boolean;
    readonly vacancyDate: Date;
}
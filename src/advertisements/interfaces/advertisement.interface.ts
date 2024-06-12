import { Date, Document } from 'mongoose';
import { Address } from 'src/addresses/intefaces/address.interface';

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

export enum AdvertisementPropertyStatus {
    APARTMENT = 'APARTMENT',
    HOUSE = 'HOUSE',
    BUILDING = 'BUILDING',
    LOT = 'LOT',
    WAREHOUSE = 'WAREHOUSE',
    OFFICE = 'OFFICE',
    COMMERCIAL = 'COMMERCIAL',
}

export enum AdvertisementPropertyType {
    UNDER_CONSTRUCTION = 'UNDER_CONSTRUCTION',
    READY_TO_MOVE = 'READY_TO_MOVE',
}

export enum AdvertisementAmenity {
    BEACHFRONT = 'BEACHFRONT',
    NEAR_BEACH = 'NEAR_BEACH',
    SWIMMING_POOL = 'SWIMMING_POOL',
    GYM = 'GYM',
    SAUNA_STEAM_BATH = 'SAUNA_STEAM_BATH',
    HOT_TUB = 'HOT_TUB',
    COVERED_PARKING = 'COVERED_PARKING',
    GAMING_AREA = 'GAMING_AREA',
    ELEVATOR = 'ELEVATOR',
    SPORTS_COURTS = 'SPORTS_COURTS',
    BBQ = 'BBQ',
    GARDEN = 'GARDEN',
    STORAGE = 'STORAGE',
    SECURITY = 'SECURITY',
    CORNER_HOUSE = 'CORNER_HOUSE',
    AIR_CONDITIONER = 'AIR_CONDITIONER',
    AIR_HEATER = 'AIR_HEATER',
    WATER_HEATER = 'WATER_HEATER',
    MINI_MARKET = 'MINI_MARKET',
    NATURAL_GAS = 'NATURAL_GAS',
}

export interface AdvertisementPhoto {
    id: string;
    name: string;
    url: String;
    order: Number;
}
export interface Advertisement extends Document  {
    readonly accountId: String;
    readonly createdUserId: String;
    readonly updatedUserId: String;
    readonly approvingUserId: String;
    readonly status: AdvertisementStatus;
    readonly transactionType: AdvertisementTransactionType;
    readonly propertyStatus: AdvertisementPropertyStatus;
    readonly propertyType: AdvertisementPropertyType;
    readonly allContentsIncluded: Boolean;
    readonly isResidentialComplex: Boolean;
    readonly isPenthouse: Boolean;
    readonly bedsCount: Number;
    readonly bathsCount: Number;
    readonly parkingCount: Number;
    readonly floorsCount: Number;
    readonly constructionYear: Number;
    readonly socioEconomicLevel: Number;
    readonly isHoaIncluded: Boolean;
    readonly amenities: AdvertisementAmenity[];
    readonly description: String;
    readonly hoaFee: Number;
    readonly lotArea: Number;
    readonly floorArea: Number;
    readonly price: Number;
    readonly pricePerFloorArea: Number;
    readonly pricePerLotArea: Number;
    readonly address: Address;
    readonly photos: AdvertisementPhoto[];
    readonly tourUrl: String;
    readonly videoUrl: String;
    readonly publishedAt: Date;
}
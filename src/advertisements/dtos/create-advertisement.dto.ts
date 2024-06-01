import { IsArray, IsBoolean, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, MaxLength, Validate, ValidateNested, isNotEmpty } from "class-validator";
import { IsObjectId } from "src/decorators/is-object-id.decorator";
import { AdvertisementAddress, AdvertisementAmenity, AdvertisementPropertyStatus, AdvertisementPropertyType, AdvertisementStatus, AdvertisementTransactionType } from '../interfaces/advertisement.interface';
import { Transform, Type } from "class-transformer";
import { IsBedsCountMandatory } from "../validators/is-beds-count-mandatory.validator";
import { IsBathsCountMandatory } from "../validators/is-baths-count-mandatory.validator";
import { IsFloorsCountMandatory } from "../validators/is-floors-count-mandatory.validator";
import { IsSocioEconomicLevel } from "../validators/is-socio-economic-level-valid.validator";

export class AdvertisementAddressDto {
    @IsString()
    country: string;

    @IsString()
    state: string;

    @IsString()
    city: string;

    @IsString()
    neighbourhood: string;
}
export class CreateAdvertisementDto {
    @IsEnum(AdvertisementTransactionType)
    transactionType: AdvertisementTransactionType;

    @IsEnum(AdvertisementPropertyStatus)
    propertyStatus: AdvertisementPropertyStatus;

    @IsEnum(AdvertisementPropertyType)
    propertyType: AdvertisementPropertyType;

    @Transform(({ obj }) => obj.transactionType !== AdvertisementTransactionType.SALE ? false : obj.allContentsIncluded)
    @IsBoolean()
    allContentsIncluded: boolean;

    @Transform(({ obj }) => obj.propertyStatus !== AdvertisementPropertyStatus.HOUSE && obj.propertyStatus !== AdvertisementPropertyStatus.APARTMENT ? false : obj.isResidentialComplex)
    @IsBoolean()
    isResidentialComplex: boolean;

    @Transform(({ obj }) => obj.propertyStatus !== AdvertisementPropertyStatus.APARTMENT ? false : obj.isPenthouse)
    @IsBoolean()
    isPenthouse: boolean;

    @IsBedsCountMandatory()
    @IsNumber()
    @IsOptional()
    bedsCount: number;

    @IsBathsCountMandatory()
    @IsNumber()
    @IsOptional()
    bathsCount: number;

    @IsNumber()
    parkingCount: number;

    @IsFloorsCountMandatory()
    @IsNumber()
    @IsOptional()
    floorsCount: number;

    @IsNumber()
    constructionYear: number;

    @IsSocioEconomicLevel()
    @IsNumber()
    socioEconomicLevel: number;

    @Transform(({ obj }) => !obj.isResidentialComplex ? false : obj.isHoaIncluded)
    @IsBoolean()
    isHoaIncluded: boolean;

    @IsArray()
    @IsEnum(AdvertisementAmenity, { each: true })
    amenities: AdvertisementAmenity[];

    @IsString()
    description: string;

    @IsNumber()
    hoaFee: number;

    @IsNumber()
    lotArea: number;

    @IsNumber()
    floorArea: number;

    @IsNumber()
    price: number;

    @IsNumber()
    pricePerFloorArea: number;

    @IsNumber()
    pricePerLotArea: number;

    @IsNotEmpty()
    @ValidateNested()
    @Type(() => AdvertisementAddressDto)
    address: AdvertisementAddressDto;

    @IsString()
    @IsOptional()
    tourUrl: string = null;

    @IsString()
    @IsOptional()
    videoUrl: string = null;

    @IsBoolean()
    isActive: boolean;

    @IsBoolean()
    isPaid: boolean;

}
import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from "class-validator";
import { AdvertisementAmenity, AdvertisementPropertyStatus, AdvertisementPropertyType, AdvertisementTransactionType } from '../interfaces/advertisement.interface';
import { Transform, Type } from "class-transformer";
import { IsBedsCountMandatory } from "../validators/is-beds-count-mandatory.validator";
import { IsBathsCountMandatory } from "../validators/is-baths-count-mandatory.validator";
import { IsFloorsCountMandatory } from "../validators/is-floors-count-mandatory.validator";
import { IsSocioEconomicLevel } from "../validators/is-socio-economic-level-valid.validator";
import { AddressDto } from "src/addresses/dtos/address.dto";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateUpdateAdvertisementDto {
    @ApiProperty()
    @IsEnum(AdvertisementTransactionType, { message: 'invalid.transactionType.must.be.one.of.the.following.values.RENT.SALE' })
    transactionType: AdvertisementTransactionType;

    @ApiProperty()
    @IsEnum(AdvertisementPropertyStatus, { message: 'invalid.propertyStatus.must.be.one.of.the.following.values.APARTMENT.HOUSE.BUILDING.LOT.WAREHOUSE.OFFICE.COMMERCIAL' })
    propertyStatus: AdvertisementPropertyStatus;

    @ApiProperty()
    @IsEnum(AdvertisementPropertyType, { message: 'invalid.propertyType.must.be.one.of.the.following.values.UNDER_CONSTRUCTION.READY_TO_MOVE' })
    propertyType: AdvertisementPropertyType;

    @ApiProperty()
    @Transform(({ obj }) => obj.transactionType !== AdvertisementTransactionType.SALE ? false : obj.allContentsIncluded)
    @IsBoolean({ message: 'invalid.allContentsIncluded.must.be.a.boolean.value'})
    allContentsIncluded: boolean;

    @ApiProperty()
    @Transform(({ obj }) => obj.propertyStatus !== AdvertisementPropertyStatus.HOUSE && obj.propertyStatus !== AdvertisementPropertyStatus.APARTMENT ? false : obj.isResidentialComplex)
    @IsBoolean({ message: 'invalid.isResidentialComplex.must.be.a.boolean.value'})
    isResidentialComplex: boolean;

    @ApiProperty()
    @Transform(({ obj }) => obj.propertyStatus !== AdvertisementPropertyStatus.APARTMENT ? false : obj.isPenthouse)
    @IsBoolean({ message: 'invalid.isPenthouse.must.be.a.boolean.value'})
    isPenthouse: boolean;

    @ApiPropertyOptional()
    @IsBedsCountMandatory()
    @IsNumber({}, { message: 'invalid.bedsCount.must.be.a.number.conforming.to.the.specified.constraints' })
    @IsOptional()
    bedsCount: number = 0;

    @ApiPropertyOptional()
    @IsBathsCountMandatory()
    @IsNumber({}, { message: 'invalid.bathsCount.must.be.a.number.conforming.to.the.specified.constraints' })
    @IsOptional()
    bathsCount: number = 0;

    @ApiProperty()
    @IsNumber({}, { message: 'invalid.parkingCount.must.be.a.number.conforming.to.the.specified.constraints' })
    parkingCount: number = 0;

    @ApiPropertyOptional()
    @IsFloorsCountMandatory()
    @IsNumber({}, { message: 'invalid.floorsCount.must.be.a.number.conforming.to.the.specified.constraints' })
    @IsOptional()
    floorsCount: number = 0;

    @ApiProperty()
    @IsNumber({}, { message: 'invalid.constructionYear.must.be.a.number.conforming.to.the.specified.constraints' })
    constructionYear: number = 0;

    @ApiPropertyOptional()
    @IsSocioEconomicLevel()
    @IsNumber({}, { message: 'invalid.socioEconomicLevel.must.be.a.number.conforming.to.the.specified.constraints' })
    socioEconomicLevel: number = 0;

    @ApiProperty()
    @Transform(({ obj }) => !obj.isResidentialComplex ? false : obj.isHoaIncluded)
    @IsBoolean({ message: 'invalid.isHoaIncluded.must.be.a.boolean.value'})
    isHoaIncluded: boolean;

    @ApiProperty()
    @IsArray({ message: 'amenities must be an array' })
    @IsEnum(AdvertisementAmenity, {message: 'invalid.amenities.must.be.one.of.the.following.values.BEACHFRONT.NEAR_BEACH.SWIMMING_POOL.GYM.SAUNA_STEAM_BATHHOT_TUB.COVERED_PARKING.GAMING_AREA.ELEVATOR.SPORTS_COURTS.BBQ.GARDEN.STORAGE.SECURITY.CORNER_HOUSE.AIR_CONDITIONER.AIR_HEATER.WATER_HEATER.MINI_MARKET.NATURAL_GAS', each: true })
    amenities: AdvertisementAmenity[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty({ message: 'invalid.description.should.not.be.empty' })
    @IsString({ message: 'invalid.description.must.be.a.string' })
    description: string;

    @ApiProperty()
    @IsNumber({}, { message: 'invalid.hoaFee.must.be.a.number.conforming.to.the.specified.constraints' })
    hoaFee: number = 0;

    @ApiProperty()
    @IsNumber({}, { message: 'invalid.lotArea.must.be.a.number.conforming.to.the.specified.constraints' })
    lotArea: number = 0;

    @ApiProperty()
    @IsNumber({}, { message: 'invalid.floorArea.must.be.a.number.conforming.to.the.specified.constraints' })
    floorArea: number = 0;

    @ApiProperty()
    @IsNumber({}, { message: 'invalid.price.must.be.a.number.conforming.to.the.specified.constraints' })
    @Min(1, { message: 'price.must.not.be.less.than.0.99' })
    price: number = 0;

    @ApiProperty()
    @IsNotEmpty({ message: 'invalid.address.should.not.be.empty' })
    @ValidateNested()
    @Type(() => AddressDto)
    address: AddressDto;

    @ApiProperty()
    @IsString({ message: 'invalid.tourUrl.must.be.a.string' })
    @IsOptional()
    tourUrl: string = null;

    @ApiProperty()
    @IsString({ message: 'invalid.videoUrl.must.be.a.string' })
    @IsOptional()
    videoUrl: string = null;

    @ApiProperty()
    @IsOptional()
    @IsNumber({}, { message: 'invalid.pricePerFloorArea.must.be.a.number.conforming.to.the.specified.constraints' })
    @Transform(({ obj }) => obj.price / (obj.floorArea || 1))
    pricePerFloorArea: number = 0;

    @ApiProperty()
    @IsNumber({}, { message: 'invalid.pricePerLotArea.must.be.a.number.conforming.to.the.specified.constraints' })
    @Transform(({ obj }) => obj.price / (obj.lotArea || 1))
    pricePerLotArea: number = 0;
}
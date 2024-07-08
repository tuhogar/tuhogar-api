import { IsArray, IsBoolean, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from "class-validator";
import { AdvertisementType, AdvertisementConstructionType, AdvertisementTransactionType } from '../interfaces/advertisement.interface';
import { Transform, Type } from "class-transformer";
import { AdvertisementIsBedsCountMandatory } from "../validators/advertisement-is-beds-count-mandatory.validator";
import { AdvertisementIsBathsCountMandatory } from "../validators/advertisement-is-baths-count-mandatory.validator";
import { AdvertisementIsFloorsCountMandatory } from "../validators/advertisement-is-floors-count-mandatory.validator";
import { AdvertisementIsSocioEconomicLevel } from "../validators/advertisement-is-socio-economic-level-valid.validator";
import { AddressDto } from "src/addresses/dtos/address.dto";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AdvertisementIsPropertyTaxMandatory } from "../validators/advertisement-is-property-tax-mandatory.validator";
import { AmenityIsExistingId } from "src/amenities/validators/amenitiy-is-existing-id.validator";

export class CreateUpdateAdvertisementDto {
    @ApiProperty()
    @IsEnum(AdvertisementTransactionType, { message: 'invalid.transactionType.must.be.one.of.the.following.values.RENT.SALE' })
    transactionType: AdvertisementTransactionType;

    @ApiProperty()
    @IsEnum(AdvertisementType, { message: 'invalid.type.must.be.one.of.the.following.values.APARTMENT.HOUSE.BUILDING.LOT.WAREHOUSE.OFFICE.COMMERCIAL' })
    type: AdvertisementType;

    @ApiProperty()
    @IsEnum(AdvertisementConstructionType, { message: 'invalid.constructionType.must.be.one.of.the.following.values.UNDER_CONSTRUCTION.READY_TO_MOVE' })
    constructionType: AdvertisementConstructionType;

    @ApiProperty()
    @Transform(({ obj }) => obj.transactionType !== AdvertisementTransactionType.SALE ? false : obj.allContentsIncluded)
    @IsBoolean({ message: 'invalid.allContentsIncluded.must.be.a.boolean.value'})
    allContentsIncluded: boolean;

    @ApiProperty()
    @Transform(({ obj }) => obj.type !== AdvertisementType.HOUSE && obj.type !== AdvertisementType.APARTMENT && obj.type !== AdvertisementType.LOT ? false : obj.isResidentialComplex)
    @IsBoolean({ message: 'invalid.isResidentialComplex.must.be.a.boolean.value'})
    isResidentialComplex: boolean;

    @ApiProperty()
    @Transform(({ obj }) => obj.type !== AdvertisementType.APARTMENT ? false : obj.isPenthouse)
    @IsBoolean({ message: 'invalid.isPenthouse.must.be.a.boolean.value'})
    isPenthouse: boolean;

    @ApiPropertyOptional()
    @AdvertisementIsBedsCountMandatory()
    @IsNumber({}, { message: 'invalid.bedsCount.must.be.a.number.conforming.to.the.specified.constraints' })
    @IsOptional()
    bedsCount: number = 0;

    @ApiPropertyOptional()
    @AdvertisementIsBathsCountMandatory()
    @IsNumber({}, { message: 'invalid.bathsCount.must.be.a.number.conforming.to.the.specified.constraints' })
    @IsOptional()
    bathsCount: number = 0;

    @ApiProperty()
    @IsNumber({}, { message: 'invalid.parkingCount.must.be.a.number.conforming.to.the.specified.constraints' })
    parkingCount: number = 0;

    @ApiPropertyOptional()
    @AdvertisementIsFloorsCountMandatory()
    @IsNumber({}, { message: 'invalid.floorsCount.must.be.a.number.conforming.to.the.specified.constraints' })
    @IsOptional()
    floorsCount: number = 0;

    @ApiProperty()
    @IsNumber({}, { message: 'invalid.constructionYear.must.be.a.number.conforming.to.the.specified.constraints' })
    constructionYear: number = 0;

    @ApiPropertyOptional()
    @AdvertisementIsSocioEconomicLevel()
    @IsNumber({}, { message: 'invalid.socioEconomicLevel.must.be.a.number.conforming.to.the.specified.constraints' })
    socioEconomicLevel: number = 0;

    @ApiProperty()
    @IsBoolean({ message: 'invalid.isHoaIncluded.must.be.a.boolean.value'})
    isHoaIncluded: boolean;

    @ApiProperty({ type: [String] })
    @IsArray({ message: 'amenities.must.be.an.array' })
    @IsMongoId({ each: true, message: 'invalid.planId' })
    @AmenityIsExistingId({ each: true, message: 'each.amenity.id.must.exist' })
    amenities: string[];

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

    @ApiPropertyOptional()
    @AdvertisementIsPropertyTaxMandatory()
    @IsNumber({}, { message: 'invalid.propertyTax.must.be.a.number.conforming.to.the.specified.constraints' })
    @IsOptional()
    propertyTax: number = 0;

    @ApiProperty({ type: [AddressDto] })
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
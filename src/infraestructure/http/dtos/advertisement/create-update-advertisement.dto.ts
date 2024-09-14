import { IsArray, IsBoolean, IsEnum, IsISO8601, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from "class-validator";
import { AdvertisementType, AdvertisementConstructionType, AdvertisementTransactionType } from '../../../../domain/entities/advertisement.interface';
import { Transform, Type } from "class-transformer";
import { AdvertisementIsBedsCountMandatory } from "../../validators/advertisement/advertisement-is-beds-count-mandatory.validator";
import { AdvertisementIsBathsCountMandatory } from "../../validators/advertisement/advertisement-is-baths-count-mandatory.validator";
import { AdvertisementIsFloorsCountMandatory } from "../../validators/advertisement/advertisement-is-floors-count-mandatory.validator";
import { AdvertisementIsSocioEconomicLevel } from "../../validators/advertisement/advertisement-is-socio-economic-level-valid.validator";
import { AddressDto } from "../address/address.dto";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AdvertisementIsPropertyTaxMandatory } from "../../validators/advertisement/advertisement-is-property-tax-mandatory.validator";
import { AmenityIsExistingId } from "src/infraestructure/http/validators/amenity/amenitiy-is-existing-id.validator";
import { Property } from "src/infraestructure/decorators/property.decorator";

export class CreateUpdateAdvertisementDto {
    @ApiProperty()
    @IsEnum(AdvertisementTransactionType, { message: 'invalid.transactionType.must.be.one.of.the.following.values.RENT.SALE' })
    @Property()
    transactionType: AdvertisementTransactionType;

    @ApiProperty()
    @IsEnum(AdvertisementType, { message: 'invalid.type.must.be.one.of.the.following.values.APARTMENT.HOUSE.BUILDING.LOT.WAREHOUSE.OFFICE.COMMERCIAL' })
    @Property()
    type: AdvertisementType;

    @ApiProperty()
    @IsEnum(AdvertisementConstructionType, { message: 'invalid.constructionType.must.be.one.of.the.following.values.UNDER_CONSTRUCTION.READY_TO_MOVE' })
    @Property()
    constructionType: AdvertisementConstructionType;

    @ApiProperty()
    @Transform(({ obj }) => obj.transactionType !== AdvertisementTransactionType.SALE ? false : obj.allContentsIncluded)
    @IsBoolean({ message: 'invalid.allContentsIncluded.must.be.a.boolean.value'})
    @Property()
    allContentsIncluded: boolean;

    @ApiProperty()
    @Transform(({ obj }) => obj.type !== AdvertisementType.HOUSE && obj.type !== AdvertisementType.APARTMENT && obj.type !== AdvertisementType.LOT ? false : obj.isResidentialComplex)
    @IsBoolean({ message: 'invalid.isResidentialComplex.must.be.a.boolean.value'})
    @Property()
    isResidentialComplex: boolean;

    @ApiProperty()
    @Transform(({ obj }) => obj.type !== AdvertisementType.APARTMENT ? false : obj.isPenthouse)
    @IsBoolean({ message: 'invalid.isPenthouse.must.be.a.boolean.value'})
    @Property()
    isPenthouse: boolean;

    @ApiPropertyOptional()
    @AdvertisementIsBedsCountMandatory()
    @IsNumber({}, { message: 'invalid.bedsCount.must.be.a.number.conforming.to.the.specified.constraints' })
    @IsOptional()
    @Property()
    bedsCount: number = 0;

    @ApiPropertyOptional()
    @AdvertisementIsBathsCountMandatory()
    @IsNumber({}, { message: 'invalid.bathsCount.must.be.a.number.conforming.to.the.specified.constraints' })
    @IsOptional()
    @Property()
    bathsCount: number = 0;

    @ApiProperty()
    @IsNumber({}, { message: 'invalid.parkingCount.must.be.a.number.conforming.to.the.specified.constraints' })
    @Property()
    parkingCount: number = 0;

    @ApiPropertyOptional()
    @AdvertisementIsFloorsCountMandatory()
    @IsNumber({}, { message: 'invalid.floorsCount.must.be.a.number.conforming.to.the.specified.constraints' })
    @IsOptional()
    @Property()
    floorsCount: number = 0;

    @ApiProperty()
    @IsNumber({}, { message: 'invalid.constructionYear.must.be.a.number.conforming.to.the.specified.constraints' })
    @Property()
    constructionYear: number = 0;

    @ApiPropertyOptional()
    @AdvertisementIsSocioEconomicLevel()
    @IsNumber({}, { message: 'invalid.socioEconomicLevel.must.be.a.number.conforming.to.the.specified.constraints' })
    @Property()
    socioEconomicLevel: number = 0;

    @ApiProperty()
    @IsBoolean({ message: 'invalid.isHoaIncluded.must.be.a.boolean.value'})
    @Property()
    isHoaIncluded: boolean;

    @ApiProperty({ type: [String] })
    @IsArray({ message: 'amenities.must.be.an.array' })
    @IsMongoId({ each: true, message: 'invalid.amenityId' })
    @AmenityIsExistingId({ each: true, message: 'each.amenity.id.must.exist' })
    @Property()
    amenities: string[];

    @ApiPropertyOptional({ type: [String] })
    @IsArray({ message: 'communityAmenities.must.be.an.array' })
    @IsMongoId({ each: true, message: 'invalid.amenityId' })
    @AmenityIsExistingId({ each: true, message: 'each.communityAmenities.id.must.exist' })
    @IsOptional()
    @Property()
    communityAmenities: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty({ message: 'invalid.description.should.not.be.empty' })
    @IsString({ message: 'invalid.description.must.be.a.string' })
    @Property()
    description: string;

    @ApiProperty()
    @IsNumber({}, { message: 'invalid.hoaFee.must.be.a.number.conforming.to.the.specified.constraints' })
    @Property()
    hoaFee: number = 0;

    @ApiProperty()
    @IsNumber({}, { message: 'invalid.lotArea.must.be.a.number.conforming.to.the.specified.constraints' })
    @Property()
    lotArea: number = 0;

    @ApiProperty()
    @IsNumber({}, { message: 'invalid.floorArea.must.be.a.number.conforming.to.the.specified.constraints' })
    @Property()
    floorArea: number = 0;

    @ApiProperty()
    @IsNumber({}, { message: 'invalid.price.must.be.a.number.conforming.to.the.specified.constraints' })
    @Min(1, { message: 'price.must.not.be.less.than.0.99' })
    @Property()
    price: number = 0;

    @ApiPropertyOptional()
    @AdvertisementIsPropertyTaxMandatory()
    @IsNumber({}, { message: 'invalid.propertyTax.must.be.a.number.conforming.to.the.specified.constraints' })
    @IsOptional()
    @Property()
    propertyTax: number = 0;

    @ApiProperty({ type: [AddressDto] })
    @IsNotEmpty({ message: 'invalid.address.should.not.be.empty' })
    @ValidateNested()
    @Type(() => AddressDto)
    @Property()
    address: AddressDto;

    @ApiProperty()
    @IsString({ message: 'invalid.tourUrl.must.be.a.string' })
    @IsOptional()
    @Property()
    tourUrl: string = null;

    @ApiProperty()
    @IsString({ message: 'invalid.videoUrl.must.be.a.string' })
    @IsOptional()
    @Property()
    videoUrl: string = null;

    @ApiProperty()
    @IsOptional()
    @IsNumber({}, { message: 'invalid.pricePerFloorArea.must.be.a.number.conforming.to.the.specified.constraints' })
    @Transform(({ obj }) => Math.floor(obj.price / (obj.floorArea || 1)))
    @Property()
    pricePerFloorArea: number = 0;

    @ApiProperty()
    @IsNumber({}, { message: 'invalid.pricePerLotArea.must.be.a.number.conforming.to.the.specified.constraints' })
    @Transform(({ obj }) => Math.floor(obj.price / (obj.lotArea || 1)))
    @Property()
    pricePerLotArea: number = 0;

    @ApiProperty()
     @IsBoolean({ message: 'invalid.isVacant.must.be.a.boolean.value'})
     @Property()
     isVacant: boolean;

     @ApiProperty()
     @IsString({ message: 'invalid.isVacant.must.be.a.string' })
     @IsISO8601()
     @IsOptional()
     @Property()
     vacancyDate: string;
}
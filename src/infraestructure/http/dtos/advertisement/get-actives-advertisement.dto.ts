import { IsArray, IsBoolean, IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from "class-validator";
import { AdvertisementType, AdvertisementConstructionType, AdvertisementTransactionType, AdvertisementActivesOrderBy } from '../../../../domain/entities/advertisement';
import { Transform, Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsGreaterThan } from "../../validators/advertisement/advertisement-is-greater-than.validator";
import { TransformToBoolean } from "../../../decorators/transform-to-boolean.decorator";
import { AmenityIsExistingId } from "src/infraestructure/http/validators/amenity/amenitiy-is-existing-id.validator";
import { AddressIsLatitudeLongitudeRadiusMandatory } from "../../validators/address/address-is-latitude-longitude-radius-mandatory.validator";
import { ContractTypeIsExistingId } from "../../validators/contract-type/contract-type-is-existing-id.validator";

export class GetActivesAdvertisementDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsMongoId({ message: 'invalid.accountId' })
    accountId: string;

    @ApiPropertyOptional()
    @IsOptional()
    @Transform(({ value }) => parseFloat(value))
    @IsNotEmpty({ message: 'invalid.code.should.not.be.empty' })
    @IsNumber({}, { message: 'invalid.price.must.be.a.number.conforming.to.the.specified.constraints' })
    code: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    @IsEnum(AdvertisementTransactionType, { each: true })
    @Type(() => String)
    @Transform(({ value }) => (Array.isArray(value) ? value : Array(value)))
    transactionType: AdvertisementTransactionType[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    @IsEnum(AdvertisementType, { each: true })
    @Type(() => String)
    @Transform(({ value }) => (Array.isArray(value) ? value : Array(value)))
    type: AdvertisementType[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    @IsEnum(AdvertisementConstructionType, { each: true })
    @Type(() => String)
    @Transform(({ value }) => (Array.isArray(value) ? value : Array(value)))
    constructionType: AdvertisementConstructionType[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean({ message: 'invalid.allContentsIncluded.must.be.a.boolean.value'})
    @TransformToBoolean()
    allContentsIncluded: boolean;
    
    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean({ message: 'invalid.isResidentialComplex.must.be.a.boolean.value'})
    @TransformToBoolean()
    isResidentialComplex: boolean;
    
    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean({ message: 'invalid.isPenthouse.must.be.a.boolean.value'})
    @TransformToBoolean()
    isPenthouse: boolean;
    
    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean({ message: 'invalid.isHoaIncluded.must.be.a.boolean.value'})
    @TransformToBoolean()
    isHoaIncluded: boolean;
    
    @ApiPropertyOptional()
    @IsOptional()
    @IsArray({ message: 'amenities.must.be.an.array' })
    @Type(() => String)
    @Transform(({ value }) => (Array.isArray(value) ? value : Array(value)))
    @AmenityIsExistingId({ each: true })
    amenity: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray({ message: 'communityAmenity.must.be.an.array' })
    @Type(() => String)
    @Transform(({ value }) => (Array.isArray(value) ? value : Array(value)))
    @AmenityIsExistingId({ each: true })
    communityAmenity: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray({ message: 'contractType.must.be.an.array' })
    @Type(() => String)
    @Transform(({ value }) => (Array.isArray(value) ? value : Array(value)))
    @ContractTypeIsExistingId({ each: true })
    contractType: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty({ message: 'address.country.should.not.be.empty' })
    @IsString({ message: 'invalid.address.country.must.be.a.string' })
    country: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty({ message: 'address.state.should.not.be.empty' })
    @IsString({ message: 'invalid.address.state.must.be.a.string' })
    state: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty({ message: 'address.city.should.not.be.empty' })
    @IsString({ message: 'invalid.address.city.must.be.a.string' })
    city: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty({ message: 'address.sector.should.not.be.empty' })
    @IsString({ message: 'invalid.address.sector.must.be.a.string' })
    sector: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty({ message: 'address.neighbourhood.should.not.be.empty' })
    @IsString({ message: 'invalid.address.neighbourhood.must.be.a.string' })
    neighbourhood: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty({ message: 'address.street.should.not.be.empty' })
    @IsString({ message: 'invalid.address.street.must.be.a.string' })
    street: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty({ message: 'address.stateSlug.should.not.be.empty' })
    @IsString({ message: 'invalid.address.stateSlug.must.be.a.string' })
    stateSlug: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty({ message: 'address.citySlug.should.not.be.empty' })
    @IsString({ message: 'invalid.address.citySlug.must.be.a.string' })
    citySlug: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty({ message: 'address.sectorSlug.should.not.be.empty' })
    @IsString({ message: 'invalid.address.sectorSlug.must.be.a.string' })
    sectorSlug: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty({ message: 'address.neighbourhoodSlug.should.not.be.empty' })
    @IsString({ message: 'invalid.address.neighbourhoodSlug.must.be.a.string' })
    neighbourhoodSlug: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty({ message: 'address.postalCode.should.not.be.empty' })
    @IsString({ message: 'invalid.address.postalCode.must.be.a.string' })
    postalCode: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty({ message: 'address.placeId.should.not.be.empty' })
    @IsString({ message: 'invalid.address.placeId.must.be.a.string' })
    placeId: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty({ message: 'address.establishment.should.not.be.empty' })
    @IsString({ message: 'invalid.address.establishment.must.be.a.string' })
    establishment: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.bedsCountMin.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    bedsCountMin: number = 0;
  
    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.bedsCountMax.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    bedsCountMax: number = 0;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.bathsCountMin.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    bathsCountMin: number = 0;
  
    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.bathsCountMax.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    bathsCountMax: number = 0;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.parkingCountMin.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    parkingCountMin: number = 0;
  
    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.parkingCountMax.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    parkingCountMax: number = 0;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.floorsCountMin.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    floorsCountMin: number = 0;
  
    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.floorsCountMax.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    floorsCountMax: number = 0;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.floorNumberMin.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    floorNumberMin: number = 0;
  
    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.floorNumberMax.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    floorNumberMax: number = 0;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.constructionYearMin.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    constructionYearMin: number = 0;
  
    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.constructionYearMax.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    @IsGreaterThan('constructionYearMin', { message: 'invalid.constructionYearMax.must.be.greater.than.or.equal.to.constructionYearMin' })
    constructionYearMax: number = 0;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.socioEconomicLevelMin.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    socioEconomicLevelMin: number = 0;
  
    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.socioEconomicLevelMax.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    @IsGreaterThan('socioEconomicLevelMin', { message: 'invalid.socioEconomicLevelMax.must.be.greater.than.or.equal.to.socioEconomicLevelMin' })
    socioEconomicLevelMax: number = 0;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.hoaFeeMin.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    hoaFeeMin: number = 0;
  
    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.hoaFeeMax.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    @IsGreaterThan('hoaFeeMin', { message: 'invalid.hoaFeeMax.must.be.greater.than.or.equal.to.hoaFeeMin' })
    hoaFeeMax: number = 0;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.lotAreaMin.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    lotAreaMin: number = 0;
  
    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.lotAreaMax.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    @IsGreaterThan('lotAreaMin', { message: 'invalid.lotAreaMax.must.be.greater.than.or.equal.to.lotAreaMin' })
    lotAreaMax: number = 0;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.floorAreaMin.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    floorAreaMin: number = 0;
  
    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.floorAreaMax.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    @IsGreaterThan('floorAreaMin', { message: 'invalid.floorAreaMax.must.be.greater.than.or.equal.to.floorAreaMin' })
    floorAreaMax: number = 0;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.priceMin.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    priceMin: number = 0;
  
    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.priceMax.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    @IsGreaterThan('priceMin', { message: 'invalid.priceMax.must.be.greater.than.or.equal.to.priceMin' })
    priceMax: number = 0;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.pricePerFloorAreaMin.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    pricePerFloorAreaMin: number = 0;
  
    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.pricePerFloorAreaMax.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    @IsGreaterThan('pricePerFloorAreaMin', { message: 'invalid.pricePerFloorAreaMax.must.be.greater.than.or.equal.to.pricePerFloorAreaMin' })
    pricePerFloorAreaMax: number = 0;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.pricePerLotAreaMin.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    pricePerLotAreaMin: number = 0;
  
    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.pricePerLotAreaMax.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    @IsGreaterThan('pricePerLotAreaMin', { message: 'invalid.pricePerLotAreaMax.must.be.greater.than.or.equal.to.pricePerLotAreaMin' })
    pricePerLotAreaMax: number = 0;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.propertyTaxMin.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    propertyTaxMin: number = 0;
  
    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.propertyTaxMax.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    @IsGreaterThan('propertyTaxMin', { message: 'invalid.propertyTaxMax.must.be.greater.than.or.equal.to.propertyTaxMin' })
    propertyTaxMax: number = 0;

    @ApiPropertyOptional()
    @AddressIsLatitudeLongitudeRadiusMandatory()
    @IsOptional()
    @Type(() => Number)
    latitude: number;

    @ApiPropertyOptional()
    @AddressIsLatitudeLongitudeRadiusMandatory()
    @IsOptional()
    @Type(() => Number)
    longitude: number;

    @ApiPropertyOptional()
    @AddressIsLatitudeLongitudeRadiusMandatory()
    @IsOptional()
    @Type(() => Number)
    @Min(1, { message: 'radius.must.not.be.less.than.1' })
    radius: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @IsNumber({}, { message: 'invalid.page.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    @Min(1, { message: 'page.must.not.be.less.than.1' })
    page: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @IsNumber({}, { message: 'invalid.limit.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    @Min(1, { message: 'limit.must.not.be.less.than.1' })
    limit: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEnum(AdvertisementActivesOrderBy, { message: 'invalid.advertisement.actives.order.by.must.be.one.of.the.following.values.highest_price.lowest_price.highest_price_m2.lowest_price_m2' })
    orderBy: AdvertisementActivesOrderBy;
}
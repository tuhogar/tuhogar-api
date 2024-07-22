import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from "class-validator";
import { AdvertisementType, AdvertisementConstructionType, AdvertisementTransactionType } from '../interfaces/advertisement.interface';
import { Transform, Type } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsGreaterThan } from "../validators/advertisement-is-greater-than.validator";
import { TransformToBoolean } from "src/decorators/transform-to-boolean.decorator";
import { AmenityIsExistingId } from "src/amenities/validators/amenitiy-is-existing-id.validator";

export class GetActivesAdvertisementDto {
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
    @IsNotEmpty({ message: 'address.neighbourhoodSlug.should.not.be.empty' })
    @IsString({ message: 'invalid.address.neighbourhoodSlug.must.be.a.string' })
    neighbourhoodSlug: string;

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
    @IsGreaterThan('bedsCountMin', { message: 'invalid.bedsCountMax.must.be.greater.than.or.equal.to.bedsCountMin' })
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
    @IsGreaterThan('bathsCountMin', { message: 'invalid.bathsCountMax.must.be.greater.than.or.equal.to.bathsCountMin' })
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
    @IsGreaterThan('parkingCountMin', { message: 'invalid.parkingCountMax.must.be.greater.than.or.equal.to.parkingCountMin' })
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
    @IsGreaterThan('floorsCountMin', { message: 'invalid.floorsCountMax.must.be.greater.than.or.equal.to.floorsCountMin' })
    floorsCountMax: number = 0;

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
    @IsOptional()
    @IsNotEmpty()
    @IsNumber({}, { message: 'invalid.page.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    @Min(0, { message: 'page.must.not.be.less.than.0' })
    page: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @IsNumber({}, { message: 'invalid.limit.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    @Min(1, { message: 'limit.must.not.be.less.than.1' })
    limit: number;
}
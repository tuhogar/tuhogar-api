import { IsArray, IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { AdvertisementType, AdvertisementConstructionType, AdvertisementTransactionType } from '../interfaces/advertisement.interface';
import { Transform, Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AmenityIsExistingKey } from "src/amenities/validators/amenitiy-is-existing-key.validator";
import { IsGreaterThan } from "../validators/advertisement-is-greater-than.validator";

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
    transactionTypes: AdvertisementTransactionType[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsArray()
    @IsEnum(AdvertisementType, { each: true })
    @Type(() => String)
    @Transform(({ value }) => (Array.isArray(value) ? value : Array(value)))
    types: AdvertisementType[];

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
    @Transform(({ value }) => {
        if (typeof value === 'boolean') {
          return value;
        }
        if (typeof value === 'string') {
          return value.toLowerCase() === 'true';
        }
        if (typeof value === 'number') {
          return value !== 0;
        }
        return false;
      })
    allContentsIncluded: boolean;
    
    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean({ message: 'invalid.isResidentialComplex.must.be.a.boolean.value'})
    @Transform(({ value }) => {
        if (typeof value === 'boolean') {
          return value;
        }
        if (typeof value === 'string') {
          return value.toLowerCase() === 'true';
        }
        if (typeof value === 'number') {
          return value !== 0;
        }
        return false;
      })
    isResidentialComplex: boolean;
    
    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean({ message: 'invalid.isPenthouse.must.be.a.boolean.value'})
    @Transform(({ value }) => {
        if (typeof value === 'boolean') {
          return value;
        }
        if (typeof value === 'string') {
          return value.toLowerCase() === 'true';
        }
        if (typeof value === 'number') {
          return value !== 0;
        }
        return false;
      })
    isPenthouse: boolean;
    
    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean({ message: 'invalid.isHoaIncluded.must.be.a.boolean.value'})
    @Transform(({ value }) => {
        if (typeof value === 'boolean') {
          return value;
        }
        if (typeof value === 'string') {
          return value.toLowerCase() === 'true';
        }
        if (typeof value === 'number') {
          return value !== 0;
        }
        return false;
      })
    isHoaIncluded: boolean;
    
    @ApiPropertyOptional()
    @IsOptional()
    @IsArray({ message: 'amenities.must.be.an.array' })
    @Type(() => String)
    @Transform(({ value }) => (Array.isArray(value) ? value : Array(value)))
    @AmenityIsExistingKey({ each: true })
    amenities: string[];

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
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.bedsCountFrom.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    bedsCountFrom: number = 0;
  
    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.bedsCountTo.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    @IsGreaterThan('bedsCountFrom', { message: 'invalid.bedsCountTo.must.be.greater.than.or.equal.to.bedsCountFrom' })
    bedsCountTo: number = 0;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.bathsCountFrom.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    bathsCountFrom: number = 0;
  
    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.bathsCountTo.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    @IsGreaterThan('bathsCountFrom', { message: 'invalid.bathsCountTo.must.be.greater.than.or.equal.to.bathsCountFrom' })
    bathsCountTo: number = 0;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.parkingCountFrom.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    parkingCountFrom: number = 0;
  
    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.parkingCountTo.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    @IsGreaterThan('parkingCountFrom', { message: 'invalid.parkingCountTo.must.be.greater.than.or.equal.to.parkingCountFrom' })
    parkingCountTo: number = 0;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.floorsCountFrom.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    floorsCountFrom: number = 0;
  
    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.floorsCountTo.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    @IsGreaterThan('floorsCountFrom', { message: 'invalid.floorsCountTo.must.be.greater.than.or.equal.to.floorsCountFrom' })
    floorsCountTo: number = 0;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.constructionYearFrom.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    constructionYearFrom: number = 0;
  
    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.constructionYearTo.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    @IsGreaterThan('constructionYearFrom', { message: 'invalid.constructionYearTo.must.be.greater.than.or.equal.to.constructionYearFrom' })
    constructionYearTo: number = 0;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.socioEconomicLevelFrom.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    socioEconomicLevelFrom: number = 0;
  
    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.socioEconomicLevelTo.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    @IsGreaterThan('socioEconomicLevelFrom', { message: 'invalid.socioEconomicLevelTo.must.be.greater.than.or.equal.to.socioEconomicLevelFrom' })
    socioEconomicLevelTo: number = 0;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.hoaFeeFrom.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    hoaFeeFrom: number = 0;
  
    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.hoaFeeTo.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    @IsGreaterThan('hoaFeeFrom', { message: 'invalid.hoaFeeTo.must.be.greater.than.or.equal.to.hoaFeeFrom' })
    hoaFeeTo: number = 0;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.lotAreaFrom.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    lotAreaFrom: number = 0;
  
    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.lotAreaTo.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    @IsGreaterThan('lotAreaFrom', { message: 'invalid.lotAreaTo.must.be.greater.than.or.equal.to.lotAreaFrom' })
    lotAreaTo: number = 0;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.floorAreaFrom.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    floorAreaFrom: number = 0;
  
    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.floorAreaTo.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    @IsGreaterThan('floorAreaFrom', { message: 'invalid.floorAreaTo.must.be.greater.than.or.equal.to.floorAreaFrom' })
    floorAreaTo: number = 0;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.priceFrom.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    priceFrom: number = 0;
  
    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.priceTo.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    @IsGreaterThan('priceFrom', { message: 'invalid.priceTo.must.be.greater.than.or.equal.to.priceFrom' })
    priceTo: number = 0;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.pricePerFloorAreaFrom.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    pricePerFloorAreaFrom: number = 0;
  
    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.pricePerFloorAreaTo.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    @IsGreaterThan('pricePerFloorAreaFrom', { message: 'invalid.pricePerFloorAreaTo.must.be.greater.than.or.equal.to.pricePerFloorAreaFrom' })
    pricePerFloorAreaTo: number = 0;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.pricePerLotAreaFrom.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    pricePerLotAreaFrom: number = 0;
  
    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber({}, { message: 'invalid.pricePerLotAreaTo.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    @IsGreaterThan('pricePerLotAreaFrom', { message: 'invalid.pricePerLotAreaTo.must.be.greater.than.or.equal.to.pricePerLotAreaFrom' })
    pricePerLotAreaTo: number = 0;
}
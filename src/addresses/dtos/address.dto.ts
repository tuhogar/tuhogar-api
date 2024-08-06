import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import slugify from "slugify";
import { Property } from "src/decorators/property.decorator";

export class AddressDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty({ message: 'address.country.should.not.be.empty' })
    @IsString({ message: 'invalid.address.country.must.be.a.string' })
    @Property()
    country: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty({ message: 'address.state.should.not.be.empty' })
    @IsString({ message: 'invalid.address.state.must.be.a.string' })
    @Property()
    state: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty({ message: 'address.city.should.not.be.empty' })
    @IsString({ message: 'invalid.address.city.must.be.a.string' })
    @Property()
    city: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty({ message: 'address.neighbourhood.should.not.be.empty' })
    @IsString({ message: 'invalid.address.neighbourhood.must.be.a.string' })
    @Property()
    neighbourhood: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty({ message: 'address.street.should.not.be.empty' })
    @IsString({ message: 'invalid.address.street.must.be.a.string' })
    @Property()
    street: string;

    @Transform(({ obj }) => {
      const adjusted = obj.state.replace(/,|\.|D\.C\./g, '').trim();
      return slugify(adjusted, { lower: true, strict: true });
    })
    @Property()
    stateSlug: string;

    @Transform(({ obj }) => {
        const adjusted = obj.city.replace(/,|\.|D\.C\./g, '').trim();
        return slugify(adjusted, { lower: true, strict: true });
      })
    @Property()
    citySlug: string;

    @Transform(({ obj }) => slugify(obj.neighbourhood, { lower: true, strict: true }))
    @Property()
    neighbourhoodSlug: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber({}, { message: 'invalid.latitude.must.be.a.number.conforming.to.the.specified.constraints' })
    @Property()
    latitude: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumber({}, { message: 'invalid.longitude.must.be.a.number.conforming.to.the.specified.constraints' })
    @Property()
    longitude: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty({ message: 'address.postalCode.should.not.be.empty' })
    @IsString({ message: 'invalid.address.postalCode.must.be.a.string' })
    @Property()
    postalCode: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty({ message: 'address.placeId.should.not.be.empty' })
    @IsString({ message: 'invalid.address.placeId.must.be.a.string' })
    @Property()
    placeId: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty({ message: 'address.establishment.should.not.be.empty' })
    @IsString({ message: 'invalid.address.establishment.must.be.a.string' })
    @Property()
    establishment: string;
}
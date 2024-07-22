import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
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

    @Transform(({ obj }) => slugify(obj.state, { lower: true, strict: true }))
    @Property()
    stateSlug: string;

    @Transform(({ obj }) => slugify(obj.city, { lower: true, strict: true }))
    @Property()
    citySlug: string;

    @Transform(({ obj }) => slugify(obj.neighbourhood, { lower: true, strict: true }))
    @Property()
    neighbourhoodSlug: string;
}
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import slugify from "slugify";

export class AddressDto {
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

    @Transform(({ obj }) => slugify(obj.state, { lower: true, strict: true }))
    stateSlug: string;

    @Transform(({ obj }) => slugify(obj.city, { lower: true, strict: true }))
    citySlug: string;

    @Transform(({ obj }) => slugify(obj.neighbourhood, { lower: true, strict: true }))
    neighbourhoodSlug: string;
}
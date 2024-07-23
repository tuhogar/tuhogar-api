import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";
import { Property } from "src/decorators/property.decorator";

export class SocialMediaDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString({ message: 'invalid.youtube.country.must.be.a.string' })
    @Property()
    youtube: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString({ message: 'invalid.tiktok.country.must.be.a.string' })
    @Property()
    tiktok: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString({ message: 'invalid.instagram.country.must.be.a.string' })
    @Property()
    instagram: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString({ message: 'invalid.twitter.country.must.be.a.string' })
    @Property()
    twitter: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString({ message: 'invalid.facebook.country.must.be.a.string' })
    @Property()
    facebook: string;
}
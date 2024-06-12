import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class SocialMediaDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString({ message: 'invalid.youtube.country.must.be.a.string' })
    youtube: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString({ message: 'invalid.tiktok.country.must.be.a.string' })
    tiktok: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString({ message: 'invalid.instagram.country.must.be.a.string' })
    instagram: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString({ message: 'invalid.twitter.country.must.be.a.string' })
    twitter: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString({ message: 'invalid.facebook.country.must.be.a.string' })
    facebook: string;
}
import { IsOptional, IsString } from "class-validator";

export class SocialMediaDto {
    @IsOptional()
    @IsString({ message: 'invalid.youtube.country.must.be.a.string' })
    youtube: string;

    @IsOptional()
    @IsString({ message: 'invalid.tiktok.country.must.be.a.string' })
    tiktok: string;

    @IsOptional()
    @IsString({ message: 'invalid.instagram.country.must.be.a.string' })
    instagram: string;

    @IsOptional()
    @IsString({ message: 'invalid.twitter.country.must.be.a.string' })
    twitter: string;

    @IsOptional()
    @IsString({ message: 'invalid.facebook.country.must.be.a.string' })
    facebook: string;
}
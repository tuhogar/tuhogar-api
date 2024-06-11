import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from "class-validator";
import { AddressDto } from "../../addresses/dtos/address.dto";
import { SocialMediaDto } from "./create-social-media.dto";
import { UserDocumentType } from "../interfaces/user.interface";

export class PatchUserDto {

    @ApiProperty()
    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: 'invalid.name.should.not.be.empty' })
    @MaxLength(150, { message: 'invalid.name.must.be.shorter.than.or.equal.to.150.characters' })
    name: string;

    @ApiProperty()
    @IsOptional()
    @IsNotEmpty({ message: 'invalid.address.should.not.be.empty' })
    @ValidateNested()
    @Type(() => AddressDto)
    address: AddressDto;

    @ApiProperty()
    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: 'invalid.phone.should.not.be.empty' })
    @MaxLength(30, { message: 'invalid.phone.must.be.shorter.than.or.equal.to.30.characters' })
    phone: string;

    @ApiProperty()
    @IsOptional()
    @IsString({ message: 'invalid.whatsApp.must.be.a.string' })
    @IsNotEmpty({ message: 'invalid.whatsApp.should.not.be.empty' })
    @MaxLength(30, { message: 'invalid.whatsApp.must.be.shorter.than.or.equal.to.30.characters' })
    whatsApp: string;

    @ApiProperty()
    @IsOptional()
    @IsEnum(UserDocumentType, { message: 'invalid.documentType.must.be.one.of.the.following.values.CC.CE.NIT' })
    documentType: UserDocumentType;

    @ApiProperty()
    @IsOptional()
    @IsString({ message: 'invalid.documentNumber.must.be.a.string' })
    @IsNotEmpty({ message: 'invalid.documentNumber.should.not.be.empty' })
    @MaxLength(30, { message: 'invalid.documentNumber.must.be.shorter.than.or.equal.to.30.characters' })
    documentNumber: string;

    @ApiProperty()
    @IsOptional()
    @IsString({ message: 'invalid.webSite.must.be.a.string' })
    @IsNotEmpty({ message: 'invalid.webSite.should.not.be.empty' })
    @MaxLength(150, { message: 'invalid.webSite.must.be.shorter.than.or.equal.to.150.characters' })
    webSite: string;

    @ApiProperty()
    @IsOptional()
    @IsNotEmpty({ message: 'invalid.socialMedia.should.not.be.empty' })
    @ValidateNested()
    @Type(() => SocialMediaDto)
    socialMedia: SocialMediaDto;
}
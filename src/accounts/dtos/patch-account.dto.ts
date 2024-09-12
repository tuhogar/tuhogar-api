import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from "class-validator";
import { AccountDocumentType } from "../interfaces/account.interface";
import { Type } from "class-transformer";
import { AddressDto } from "src/addresses/dtos/address.dto";
import { Property } from "src/decorators/property.decorator";
import { SocialMediaDto } from "src/social-media/dtos/create-social-media.dto";

export class PatchAccountDto {

    @ApiPropertyOptional()
    @IsOptional()
    @IsString({ message: 'invalid.name.must.be.a.string' })
    @MaxLength(150, { message: 'invalid.name.must.be.shorter.than.or.equal.to.150.characters' })
    name: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty({ message: 'invalid.address.should.not.be.empty' })
    @ValidateNested()
    @Type(() => AddressDto)
    @Property()
    address: AddressDto;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString({ message: 'invalid.phone.must.be.a.string' })
    @IsNotEmpty({ message: 'invalid.phone.should.not.be.empty' })
    @MaxLength(30, { message: 'invalid.phone.must.be.shorter.than.or.equal.to.30.characters' })
    phone: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString({ message: 'invalid.whatsApp.must.be.a.string' })
    @IsNotEmpty({ message: 'invalid.whatsApp.should.not.be.empty' })
    @MaxLength(30, { message: 'invalid.whatsApp.must.be.shorter.than.or.equal.to.30.characters' })
    @Property()
    whatsApp: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString({ message: 'invalid.webSite.must.be.a.string' })
    @IsNotEmpty({ message: 'invalid.webSite.should.not.be.empty' })
    @MaxLength(150, { message: 'invalid.webSite.must.be.shorter.than.or.equal.to.150.characters' })
    @Property()
    webSite: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty({ message: 'invalid.socialMedia.should.not.be.empty' })
    @ValidateNested()
    @Type(() => SocialMediaDto)
    @Property()
    socialMedia: SocialMediaDto;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString({ message: 'invalid.description.must.be.a.string' })
    @IsNotEmpty({ message: 'invalid.description.should.not.be.empty' })
    @MaxLength(300, { message: 'invalid.description.must.be.shorter.than.or.equal.to.300.characters' })
    @Property()
    description: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'invalid.documentNumber.should.not.be.empty' })
    @IsEnum(AccountDocumentType, { message: 'invalid.documentType.must.be.one.of.the.following.values.CC.CE.NIT' })
    documentType: AccountDocumentType;

    @ApiProperty()
    @IsString({ message: 'invalid.documentNumber.must.be.a.string' })
    @IsNotEmpty({ message: 'invalid.documentNumber.should.not.be.empty' })
    @MaxLength(30, { message: 'invalid.documentNumber.must.be.shorter.than.or.equal.to.30.characters' })
    documentNumber: string;
}
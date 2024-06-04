import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from "class-validator";
import { AddressDto } from "src/addresses/dtos/address.dto";
import { IsObjectId } from "src/decorators/is-object-id.decorator";
import { SocialMediaDto } from "src/users/dtos/create-social-media.dto";
import { UserDocumentType } from "src/users/interfaces/user.interface";

export class CreateAccountDto {

    @IsObjectId({ message: 'invalid.planId' })
    planId: string;

    @IsNotEmpty({ message: 'invalid.name.should.not.be.empty' })
    @MaxLength(150, { message: 'invalid.name.must.be.shorter.than.or.equal.to.150.characters' })
    name: string;

    @IsNotEmpty({ message: 'invalid.address.should.not.be.empty' })
    @ValidateNested()
    @Type(() => AddressDto)
    address: AddressDto;

    @IsNotEmpty({ message: 'invalid.phone.should.not.be.empty' })
    @MaxLength(30, { message: 'invalid.phone.must.be.shorter.than.or.equal.to.30.characters' })
    phone: string;

    @IsOptional()
    @MaxLength(30, { message: 'invalid.whatsApp.must.be.shorter.than.or.equal.to.30.characters' })
    whatsApp: string;

    @IsEnum(UserDocumentType, { message: 'invalid.documentType.must.be.one.of.the.following.values.CC.CE.NIT' })
    documentType: UserDocumentType;

    @IsNotEmpty({ message: 'invalid.documentNumber.should.not.be.empty' })
    @MaxLength(30, { message: 'invalid.documentNumber.must.be.shorter.than.or.equal.to.30.characters' })
    documentNumber: string;

    @IsOptional()
    @MaxLength(150, { message: 'invalid.webSite.must.be.shorter.than.or.equal.to.150.characters' })
    webSite: string;

    @ValidateNested()
    @Type(() => SocialMediaDto)
    socialMedia: SocialMediaDto;
}
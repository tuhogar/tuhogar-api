import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from "class-validator";
import { AddressDto } from "src/addresses/dtos/address.dto";
import { IsObjectId } from "src/decorators/is-object-id.decorator";
import { SocialMediaDto } from "src/users/dtos/create-social-media.dto";
import { UserDocumentType } from "src/users/interfaces/user.interface";

export class CreateAccountDto {

    @ApiProperty()
    @IsObjectId({ message: 'invalid.planId' })
    planId: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'invalid.name.should.not.be.empty' })
    @MaxLength(150, { message: 'invalid.name.must.be.shorter.than.or.equal.to.150.characters' })
    name: string;

    /*
    @ApiProperty()
    @IsNotEmpty({ message: 'invalid.address.should.not.be.empty' })
    @ValidateNested()
    @Type(() => AddressDto)
    address: AddressDto;
    */

    @ApiProperty()
    @IsNotEmpty({ message: 'invalid.phone.should.not.be.empty' })
    @MaxLength(30, { message: 'invalid.phone.must.be.shorter.than.or.equal.to.30.characters' })
    phone: string;

    /*
    @ApiProperty()
    @IsOptional()
    @MaxLength(30, { message: 'invalid.whatsApp.must.be.shorter.than.or.equal.to.30.characters' })
    whatsApp: string;
    */

    @ApiProperty()
    @IsEnum(UserDocumentType, { message: 'invalid.documentType.must.be.one.of.the.following.values.CC.CE.NIT' })
    documentType: UserDocumentType;

    @ApiProperty()
    @IsNotEmpty({ message: 'invalid.documentNumber.should.not.be.empty' })
    @MaxLength(30, { message: 'invalid.documentNumber.must.be.shorter.than.or.equal.to.30.characters' })
    documentNumber: string;

    /*
    @ApiProperty()
    @IsOptional()
    @MaxLength(150, { message: 'invalid.webSite.must.be.shorter.than.or.equal.to.150.characters' })
    webSite: string;

    @ApiProperty()
    @ValidateNested()
    @Type(() => SocialMediaDto)
    socialMedia: SocialMediaDto;
    */
}
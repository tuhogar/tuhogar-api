import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength, ValidateNested } from "class-validator";
import { AccountDocumentType, AccountType } from "src/domain/entities/account";
import { Transform, Type } from "class-transformer";
import { AddressDto } from "../address/address.dto";
import { Property } from "src/infraestructure/decorators/property.decorator";
import { SocialMediaDto } from "../social-media/create-social-media.dto";
import { ContractTypeIsExistingId } from "../../validators/contract-type/contract-type-is-existing-id.validator";

export class PatchAccountDto {

    @ApiPropertyOptional()
     @IsOptional()
    @IsString({ message: 'invalid.name.must.be.a.string' })
    @MaxLength(150, { message: 'invalid.name.must.be.shorter.than.or.equal.to.150.characters' })
    @Property()
    name: string;

    @ApiPropertyOptional()
    @IsOptional()
    @ValidateNested()
    @Type(() => AddressDto)
    @Property()
    address: AddressDto;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString({ message: 'invalid.phone.must.be.a.string' })
    @MaxLength(30, { message: 'invalid.phone.must.be.shorter.than.or.equal.to.30.characters' })
    @Property()
    phone: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString({ message: 'invalid.whatsApp.must.be.a.string' })
    @MaxLength(30, { message: 'invalid.whatsApp.must.be.shorter.than.or.equal.to.30.characters' })
    @Property()
    whatsApp: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString({ message: 'invalid.phone2.must.be.a.string' })
    @MaxLength(30, { message: 'invalid.phone2.must.be.shorter.than.or.equal.to.30.characters' })
    @Property()
    phone2: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString({ message: 'invalid.whatsApp2.must.be.a.string' })
    @MaxLength(30, { message: 'invalid.whatsApp2.must.be.shorter.than.or.equal.to.30.characters' })
    @Property()
    whatsApp2: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString({ message: 'invalid.webSite.must.be.a.string' })
    @MaxLength(150, { message: 'invalid.webSite.must.be.shorter.than.or.equal.to.150.characters' })
    @Property()
    webSite: string;

    @ApiPropertyOptional()
    @IsOptional()
    @ValidateNested()
    @Type(() => SocialMediaDto)
    @Property()
    socialMedia: SocialMediaDto;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString({ message: 'invalid.description.must.be.a.string' })
    @MaxLength(1000, { message: 'invalid.description.must.be.shorter.than.or.equal.to.1000.characters' })
    @Property()
    description: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsEnum(AccountDocumentType, { message: 'invalid.documentType.must.be.one.of.the.following.values.CC.CE.NIT' })
    @Property()
    documentType: AccountDocumentType;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString({ message: 'invalid.documentNumber.must.be.a.string' })
    @MaxLength(30, { message: 'invalid.documentNumber.must.be.shorter.than.or.equal.to.30.characters' })
    @Property()
    documentNumber: string;

    @ApiPropertyOptional({ type: [String] })
    @IsOptional()
    @IsArray({ message: 'contractTypes.must.be.an.array' })
    @IsMongoId({ each: true, message: 'invalid.contractTypeId' })
    @ContractTypeIsExistingId({ each: true, message: 'each.contractType.id.must.exist' })
    @Property()
    contractTypes: string[];

    @ApiPropertyOptional()
    @IsOptional()
    @IsEnum(AccountType, { message: 'invalid.accountType.must.be.one.of.the.following.values.BUYER.SELLER' })
    @Property()
    accountType: AccountType;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString({ message: 'invalid.primaryColor.must.be.a.string' })
    @Property()
    primaryColor: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString({ message: 'invalid.domain.must.be.a.string' })
    @MinLength(3, { message: 'invalid.domain.must.be.at.least.3.characters' })
    @MaxLength(100, { message: 'invalid.domain.must.be.shorter.than.or.equal.to.100.characters' })
    @Matches(/^[a-zA-Z0-9]+$/, { message: 'invalid.domain.must.contain.only.letters.and.numbers' })
    @Transform(({ value }) => value ? value.toLowerCase().replace(/[^a-z0-9]/gi, '') : value)
    @Property()
    domain: string;
}
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator";
import { AccountDocumentType } from "src/domain/entities/account";
import { Property } from "src/infraestructure/decorators/property.decorator";

export class PatchBillingDto {

    @ApiPropertyOptional()
     @IsOptional()
    @IsString({ message: 'invalid.name.must.be.a.string' })
    @MaxLength(150, { message: 'invalid.name.must.be.shorter.than.or.equal.to.150.characters' })
    @Property()
    name: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString({ message: 'invalid.email.must.be.a.string' })
    @MaxLength(150, { message: 'invalid.email.must.be.shorter.than.or.equal.to.150.characters' })
    @Property()
    email: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString({ message: 'invalid.phone.must.be.a.string' })
    @MaxLength(30, { message: 'invalid.phone.must.be.shorter.than.or.equal.to.30.characters' })
    @Property()
    phone: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString({ message: 'invalid.address.must.be.a.string' })
    @MaxLength(500, { message: 'invalid.address.must.be.shorter.than.or.equal.to.500.characters' })
    @Property()
    address: string;

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
}
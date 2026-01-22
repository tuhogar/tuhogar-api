import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";
import { Transform } from "class-transformer";
import { IsExistingPlan } from "src/infraestructure/http/validators/plan/is-existing-plan.validator";
import { UserAlreadyExists } from "src/infraestructure/http/validators/user/user-already-exists.validator";
import { AccountDocumentType, AccountType } from "src/domain/entities/account";
import { Property } from "src/infraestructure/decorators/property.decorator";
import { AccountAlreadyExists } from "../../validators/account/account-already-exists.validator";

export class CreateAccountDto {

    @ApiProperty()
    @IsMongoId({ message: 'invalid.planId' })
    @IsExistingPlan()
    @Property()
    planId: string;

    @ApiProperty()
    @IsString({ message: 'invalid.name.must.be.a.string' })
    @IsNotEmpty({ message: 'invalid.name.should.not.be.empty' })
    @MaxLength(150, { message: 'invalid.name.must.be.shorter.than.or.equal.to.150.characters' })
    @UserAlreadyExists()
    @AccountAlreadyExists()
    @Property()
    name: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString({ message: 'invalid.phone.must.be.a.string' })
    @IsNotEmpty({ message: 'invalid.phone.should.not.be.empty' })
    @MaxLength(30, { message: 'invalid.phone.must.be.shorter.than.or.equal.to.30.characters' })
    @Property()
    phone: string;

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
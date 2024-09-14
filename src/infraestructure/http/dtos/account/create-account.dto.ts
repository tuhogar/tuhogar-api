import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { IsExistingPlan } from "src/infraestructure/http/validators/plan/is-existing-plan.validator";
import { UserAlreadyExists } from "src/infraestructure/http/validators/user/user-already-exists.validator";
import { AccountDocumentType } from "src/domain/entities/account.interface";
import { Property } from "src/infraestructure/decorators/property.decorator";

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
}
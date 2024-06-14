import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsMongoId, IsNotEmpty, IsString, MaxLength } from "class-validator";
import { IsExistingPlan } from "src/plans/validators/is-existing-plan.validator";
import { UserDocumentType } from "src/users/interfaces/user.interface";
import { UserAlreadyExists } from "src/users/validators/user-already-exists.validator";

export class CreateAccountDto {

    @ApiProperty()
    @IsMongoId({ message: 'invalid.planId' })
    @IsExistingPlan()
    planId: string;

    @ApiProperty()
    @IsString({ message: 'invalid.name.must.be.a.string' })
    @IsNotEmpty({ message: 'invalid.name.should.not.be.empty' })
    @MaxLength(150, { message: 'invalid.name.must.be.shorter.than.or.equal.to.150.characters' })
    @UserAlreadyExists()
    name: string;

    @ApiProperty()
    @IsString({ message: 'invalid.phone.must.be.a.string' })
    @IsNotEmpty({ message: 'invalid.phone.should.not.be.empty' })
    @MaxLength(30, { message: 'invalid.phone.must.be.shorter.than.or.equal.to.30.characters' })
    phone: string;

    @ApiProperty()
    @IsEnum(UserDocumentType, { message: 'invalid.documentType.must.be.one.of.the.following.values.CC.CE.NIT' })
    documentType: UserDocumentType;

    @ApiProperty()
    @IsString({ message: 'invalid.documentNumber.must.be.a.string' })
    @IsNotEmpty({ message: 'invalid.documentNumber.should.not.be.empty' })
    @MaxLength(30, { message: 'invalid.documentNumber.must.be.shorter.than.or.equal.to.30.characters' })
    documentNumber: string;
}
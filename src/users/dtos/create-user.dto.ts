import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { UserDocumentType, UserRole } from "../interfaces/user.interface";
import { UserAlreadyExists } from "../validators/user-already-exists.validator";

export class CreateUserDto {

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

    @ApiPropertyOptional()
    @IsOptional()
    @IsEnum(UserDocumentType, { message: 'invalid.documentType.must.be.one.of.the.following.values.CC.CE.NIT' })
    documentType: UserDocumentType;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString({ message: 'invalid.documentNumber.must.be.a.string' })
    @IsNotEmpty({ message: 'invalid.documentNumber.should.not.be.empty' })
    @MaxLength(30, { message: 'invalid.documentNumber.must.be.shorter.than.or.equal.to.30.characters' })
    documentNumber: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'invalid.userRole.should.not.be.empty' })
    @IsEnum(UserRole, { message: 'invalid.userRole.must.be.one.of.the.following.values.ADMIN.USER' })
    userRole: UserRole;
}
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString, MaxLength } from "class-validator";
import { UserRole } from "../interfaces/user.interface";
import { UserAlreadyExists } from "../validators/user-already-exists.validator";

export class CreateUserDto {

    @ApiProperty()
    @IsString({ message: 'invalid.name.must.be.a.string' })
    @IsNotEmpty({ message: 'invalid.name.should.not.be.empty' })
    @MaxLength(150, { message: 'invalid.name.must.be.shorter.than.or.equal.to.150.characters' })
    @UserAlreadyExists()
    name: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'invalid.userRole.should.not.be.empty' })
    @IsEnum(UserRole, { message: 'invalid.userRole.must.be.one.of.the.following.values.ADMIN.USER' })
    userRole: UserRole;
}
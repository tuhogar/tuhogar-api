import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString, MaxLength } from "class-validator";
import { UserDocumentType, UserRole } from "../interfaces/user.interface";

export class CreateUserMasterDto {

    @ApiProperty()
    @IsString({ message: 'invalid.name.must.be.a.string' })
    @IsNotEmpty({ message: 'invalid.name.should.not.be.empty' })
    @MaxLength(150, { message: 'invalid.name.must.be.shorter.than.or.equal.to.150.characters' })
    name: string;
}
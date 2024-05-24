import { IsEmail, IsEnum, IsNotEmpty, MaxLength } from "class-validator";
import { IsObjectId } from "src/decorators/is-object-id.decorator";
import { UserRole, UserStatus } from "../interfaces/user.interface";

export class CreateUserDto {

    @IsNotEmpty()
    @MaxLength(150)
    name: string;


    @IsEmail()
    @MaxLength(150)
    email: string;

    @IsObjectId({ message: 'Invalid ObjectId' })
    accountId: string;

    @IsEnum(UserRole)
    userRole: UserRole = UserRole.ADMIN;

    @IsEnum(UserStatus)
    status: UserStatus = UserStatus.ACTIVE;
}
import { IsEmail, IsEnum, IsNotEmpty, MaxLength, isEnum } from "class-validator";
import { IsObjectId } from "src/decorators/is-object-id.decorator";
import { AccountStatus } from '../interfaces/account.interface';

export class CreateAccountDto {

    @IsObjectId({ message: 'Invalid ObjectId' })
    planId: string;

    @IsEnum(AccountStatus)
    status: AccountStatus = AccountStatus.ACTIVE;

    @IsNotEmpty()
    @MaxLength(150)
    name: string;


    @IsEmail()
    @MaxLength(150)
    email: string;
}
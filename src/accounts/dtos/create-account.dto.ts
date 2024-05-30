import { IsNotEmpty, MaxLength } from "class-validator";
import { IsObjectId } from "src/decorators/is-object-id.decorator";
export class CreateAccountDto {

    @IsObjectId({ message: 'Invalid ObjectId' })
    planId: string;

    @IsNotEmpty()
    @MaxLength(150)
    name: string;
}
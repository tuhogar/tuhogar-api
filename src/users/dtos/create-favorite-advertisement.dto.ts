import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsMongoId, IsNotEmpty, IsString, MaxLength } from "class-validator";
import { UserRole } from "../interfaces/user.interface";
import { UserAlreadyExists } from "../validators/user-already-exists.validator";
import { Property } from "src/decorators/property.decorator";

export class CreateFavoriteAdvertisementDto {

    @ApiProperty()
    @IsMongoId({ message: 'invalid.id' })
    @Property()
    id: string;
}
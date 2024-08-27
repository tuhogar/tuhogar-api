import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsMongoId, IsNotEmpty, IsString, MaxLength } from "class-validator";
import { UserRole } from "src/domain/entities/user.interface";
import { UserAlreadyExists } from "src/infraestructure/http/validators/user/user-already-exists.validator";
import { Property } from "src/infraestructure/decorators/property.decorator";

export class CreateFavoriteAdvertisementDto {

    @ApiProperty()
    @IsMongoId({ message: 'invalid.id' })
    @Property()
    id: string;
}
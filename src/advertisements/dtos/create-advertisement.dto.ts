import { IsEnum, IsNotEmpty, MaxLength } from "class-validator";
import { IsObjectId } from "src/decorators/is-object-id.decorator";
import { AdvertisementStatus } from '../interfaces/advertisement.interface';

export class CreateAdvertisementDto {
    @IsNotEmpty()
    @MaxLength(150)
    description: string;
}
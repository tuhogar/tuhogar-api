import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { Property } from "src/infraestructure/decorators/property.decorator";

export class CreateUpdateAdvertisementReasonDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @Property()
    name: string;
}
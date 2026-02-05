import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { Property } from "src/infraestructure/decorators/property.decorator";

export class CreateBlacklistWordDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @Property()
    word: string;
}
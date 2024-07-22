import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { Property } from "src/decorators/property.decorator";

export class CreatePlanDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @Property()
    name: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @Property()
    description: string;
}
import { ApiProperty } from "@nestjs/swagger";
import { ArrayMinSize, IsArray, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Property } from "src/infraestructure/decorators/property.decorator";

export class CreatePlanDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @Property()
    name: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    @Property()
    duration: number

    @ApiProperty({ type: [String] })
    @IsNotEmpty()
    @IsArray({ message: 'items.must.be.an.array' })
    @ArrayMinSize(1, { message: 'items.must.contain.at.least.one.item' })
    @Property()
    items: string[];

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    @Property()
    price: number
}
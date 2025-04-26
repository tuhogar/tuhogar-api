import { ApiProperty } from "@nestjs/swagger";
import { ArrayMinSize, IsArray, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";
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

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @Property()
    externalId: string

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber({ allowNaN: false, allowInfinity: false }, { message: 'maxAdvertisements.must.be.a.number' })
    @IsPositive({ message: 'maxAdvertisements.must.be.positive' })
    @Property()
    maxAdvertisements?: number

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber({ allowNaN: false, allowInfinity: false }, { message: 'maxPhotos.must.be.a.number' })
    @IsPositive({ message: 'maxPhotos.must.be.positive' })
    @Property()
    maxPhotos?: number
}
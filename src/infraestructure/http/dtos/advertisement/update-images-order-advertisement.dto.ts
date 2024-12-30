import { IsArray, IsNotEmpty, IsNumber, IsString, ValidateNested } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

class UpdateImageOrderAdvertisementDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'invalid.id.should.not.be.empty' })
    @IsString({ message: 'invalid.id.must.be.a.string' })
    id: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'invalid.order.should.not.be.empty' })
    @IsNumber({}, { message: 'invalid.order.must.be.a.number.conforming.to.the.specified.constraints' })
    order: number = 0;
}

export class UpdateImagesOrderAdvertisementDto {
    @ApiProperty({ type: [UpdateImageOrderAdvertisementDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateImageOrderAdvertisementDto)
    images: UpdateImageOrderAdvertisementDto[];
}
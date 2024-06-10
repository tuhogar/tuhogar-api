import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateImagesOrdersAdvertisementDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'invalid.id.should.not.be.empty' })
    @IsString({ message: 'invalid.id.must.be.a.string' })
    id: string;

    @ApiProperty()
    @IsNumber({}, { message: 'invalid.order.must.be.a.number.conforming.to.the.specified.constraints' })
    order: number;
}
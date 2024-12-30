import { IsArray, IsNotEmpty, IsNumber, IsString, Matches, ValidateNested } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";

class UploadImageAdvertisementDto {
    @ApiProperty()
    @IsString({ message: 'invalid.name.must.be.a.string' })
    @IsNotEmpty({ message: 'invalid.name.should.not.be.empty' })
    name: string;

    @ApiProperty({type: [String]})
    @IsNotEmpty({ message: 'invalid.content.should.not.be.empty' })
    @IsString({ message: 'invalid.content.must.be.a.string' })
    content: string;

    @ApiProperty()
    @IsString({ message: 'invalid.contentType.must.be.a.string' })
    @IsNotEmpty({ message: 'invalid.contentType.should.not.be.empty' })
    @Matches(/^(image\/jpeg|image\/jpg|image\/webp|image\/png)$/, {
        message: 'invalid.contentType.must.be.one.of.the.following.types.image/jpeg.image/jpg.image/webp.image/png',
    })
    contentType: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'invalid.order.should.not.be.empty' })
    @IsNumber({}, { message: 'invalid.order.must.be.a.number.conforming.to.the.specified.constraints' })
    order: number = 0;
}

export class UploadImagesAdvertisementDto {
    @ApiProperty({ type: [UploadImageAdvertisementDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UploadImageAdvertisementDto)
    images: UploadImageAdvertisementDto[];
}
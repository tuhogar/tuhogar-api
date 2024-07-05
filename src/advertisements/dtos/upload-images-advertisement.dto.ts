import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, ValidateNested } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { AdvertisementIsMandatoryImageFieldIfNotId } from "../validators/advertisement-is-mandatory-image-field-if-not-id.validator";
import { AdvertisementIsNotMandatoryImageFieldIfId } from "../validators/advertisement-is-mandatory-image-field-if-id.validator";

class UploadImageAdvertisementDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsNotEmpty({ message: 'invalid.id.should.not.be.empty' })
    @IsString({ message: 'invalid.id.must.be.a.string' })
    id: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString({ message: 'invalid.name.must.be.a.string' })
    @IsNotEmpty({ message: 'invalid.name.should.not.be.empty' })
    @AdvertisementIsMandatoryImageFieldIfNotId()
    name: string;

    @ApiPropertyOptional({type: [ArrayBuffer]})
    @IsOptional()
    @IsNotEmpty({ message: 'invalid.content.should.not.be.empty' })
    @AdvertisementIsMandatoryImageFieldIfNotId()
    content: ArrayBuffer;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString({ message: 'invalid.contentType.must.be.a.string' })
    @IsNotEmpty({ message: 'invalid.contentType.should.not.be.empty' })
    @Matches(/^(image\/jpeg|image\/jpg|image\/img|image\/png)$/, {
        message: 'invalid.contentType.must.be.one.of.the.following.types.image/jpeg.image/jpg.image/img.image/png',
    })
    @AdvertisementIsMandatoryImageFieldIfNotId()
    contentType: string;

    @ApiProperty()
    @IsNumber({}, { message: 'invalid.order.must.be.a.number.conforming.to.the.specified.constraints' })
    @AdvertisementIsMandatoryImageFieldIfNotId()
    @AdvertisementIsNotMandatoryImageFieldIfId()
    order: number = 0;
}

export class UploadImagesAdvertisementDto {
    @ApiProperty({ type: [UploadImageAdvertisementDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UploadImageAdvertisementDto)
    images: UploadImageAdvertisementDto[];
}
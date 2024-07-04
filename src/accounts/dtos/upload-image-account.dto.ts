import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, ValidateNested } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UploadImageAccountDto {
    @ApiProperty()
    @IsString({ message: 'invalid.name.must.be.a.string' })
    @IsNotEmpty({ message: 'invalid.name.should.not.be.empty' })
    name: string;

    @ApiProperty()
    @IsNotEmpty({ message: 'invalid.content.should.not.be.empty' })
    content: ArrayBuffer;

    @ApiProperty()
    @IsString({ message: 'invalid.contentType.must.be.a.string' })
    @IsNotEmpty({ message: 'invalid.contentType.should.not.be.empty' })
    @Matches(/^(image\/jpeg|image\/jpg|image\/img|image\/png)$/, {
        message: 'invalid.contentType.must.be.one.of.the.following.types.image/jpeg.image/jpg.image/img.image/png',
    })
    contentType: string;
}
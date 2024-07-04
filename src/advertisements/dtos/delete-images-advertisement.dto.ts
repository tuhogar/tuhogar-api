import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, ValidateNested } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

class DeleteImageAdvertisementDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'invalid.id.should.not.be.empty' })
    @IsString({ message: 'invalid.id.must.be.a.string' })
    id: string;
}

export class DeleteImagesAdvertisementDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DeleteImageAdvertisementDto)
    images: DeleteImageAdvertisementDto[];
}
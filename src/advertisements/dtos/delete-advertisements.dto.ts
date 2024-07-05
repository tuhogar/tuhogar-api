import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, ValidateNested } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

class DeleteAdvertisementDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'invalid.id.should.not.be.empty' })
    @IsString({ message: 'invalid.id.must.be.a.string' })
    id: string;
}

export class DeleteAdvertisementsDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => DeleteAdvertisementDto)
    advertisements: DeleteAdvertisementDto[];
}
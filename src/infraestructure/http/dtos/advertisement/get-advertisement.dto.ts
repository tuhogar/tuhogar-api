import { IsNotEmpty, IsNumber, IsOptional, Min } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class GetAdvertisementDto {
   @ApiProperty()
    @IsNotEmpty()
    @IsNumber({}, { message: 'invalid.page.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    @Min(1, { message: 'page.must.not.be.less.than.1' })
    page: number;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber({}, { message: 'invalid.limit.must.be.a.number.conforming.to.the.specified.constraints' })
    @Type(() => Number)
    @Min(1, { message: 'limit.must.not.be.less.than.1' })
    limit: number;
}
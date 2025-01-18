import { IsNotEmpty, IsString, Min, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class GetActivesAdvertisementLocationDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'address.query.should.not.be.empty' })
    @IsString({ message: 'invalid.query.must.be.a.string' })
    @MinLength(3, { message: 'invalid.query.must.be.longer.than.or.equal.to.3.characters' })
    query: string;
}
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { Property } from "src/infraestructure/decorators/property.decorator";

export class PatchUserDto {

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: 'invalid.name.should.not.be.empty' })
    @MaxLength(150, { message: 'invalid.name.must.be.shorter.than.or.equal.to.150.characters' })
    @Property()
    name: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: 'invalid.phone.should.not.be.empty' })
    @MaxLength(30, { message: 'invalid.phone.must.be.shorter.than.or.equal.to.30.characters' })
    @Property()
    phone: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString({ message: 'invalid.whatsApp.must.be.a.string' })
    @IsNotEmpty({ message: 'invalid.whatsApp.should.not.be.empty' })
    @MaxLength(30, { message: 'invalid.whatsApp.must.be.shorter.than.or.equal.to.30.characters' })
    @Property()
    whatsApp: string;
}
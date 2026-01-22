import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsString } from "class-validator";
import { Property } from "src/infraestructure/decorators/property.decorator";

export class CreateAccountEventDto {
    @ApiProperty()
    @IsMongoId({ message: 'invalid.account.id' })
    @Property()
    accountId: string;

    @ApiProperty()
    @IsString({ message: 'invalid.type.must.be.a.string' })
    @Property()
    type: string;
}
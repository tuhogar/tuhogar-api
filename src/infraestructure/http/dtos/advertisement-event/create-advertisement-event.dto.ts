import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsString } from "class-validator";
import { Property } from "src/infraestructure/decorators/property.decorator";

export class CreateAdvertisementEventDto {
    @ApiProperty()
    @IsMongoId({ message: 'invalid.advertisement.id' })
    @Property()
    advertisementId: string;

    @ApiProperty()
    @IsString({ message: 'invalid.type.must.be.a.string' })
    @Property()
    type: string;
}
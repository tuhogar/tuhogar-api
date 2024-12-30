import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId } from "class-validator";
import { IsExistingAdvertisementReason } from "src/infraestructure/http/validators/advertisement-reason/is-existing-advertisement-reason.validator";
import { Property } from "src/infraestructure/decorators/property.decorator";

export class CreateAdvertisementReportDto {
    @ApiProperty()
    @IsMongoId({ message: 'invalid.advertisement.reason.id' })
    @IsExistingAdvertisementReason()
    @Property()
    advertisementReasonId: string;

    @ApiProperty()
    @IsMongoId({ message: 'invalid.advertisement.id' })
    @Property()
    advertisementId: string;
}
import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId } from "class-validator";
import { IsExistingAdvertisementReason } from "src/advertisement-reasons/validators/is-existing-advertisement-reason.validator";

export class CreateAdvertisementReportDto {
    @ApiProperty()
    @IsMongoId({ message: 'invalid.advertisement.reason.id' })
    @IsExistingAdvertisementReason()
    advertisementReasonId: string;

    @ApiProperty()
    @IsMongoId({ message: 'invalid.advertisement.id' })
    advertisementId: string;
}
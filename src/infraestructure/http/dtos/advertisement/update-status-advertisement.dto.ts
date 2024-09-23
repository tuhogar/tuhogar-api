import { IsEnum } from "class-validator";
import { AdvertisementStatus } from '../../../../domain/entities/advertisement';
import { ApiProperty } from "@nestjs/swagger";
import { AdvertisementIsStatusValid } from "../../validators/advertisement/advertisement-is-status-valid.validator";
import { Property } from "src/infraestructure/decorators/property.decorator";

export class UpdateStatusAdvertisementDto {
    @ApiProperty()
    @AdvertisementIsStatusValid()
    @IsEnum(AdvertisementStatus, { message: 'invalid.status.must.be.one.of.the.following.values.ACTIVE.INACTIVE.PAUSED_BY_USER.PAUSED_BY_APPLICATION.WAITING_FOR_APPROVAL' })
    @Property()
    status: AdvertisementStatus;
}
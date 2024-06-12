import { IsEnum } from "class-validator";
import { AdvertisementStatus } from '../interfaces/advertisement.interface';
import { ApiProperty } from "@nestjs/swagger";
import { IsStatusValid } from "../validators/is-status-valid.validator";

export class UpdateStatusAdvertisementDto {
    @ApiProperty()
    @IsStatusValid()
    @IsEnum(AdvertisementStatus, { message: 'invalid.status.must.be.one.of.the.following.values.ACTIVE.INACTIVE.PAUSED_BY_USER.PAUSED_BY_APPLICATION.WAITING_FOR_APPROVAL' })
    status: AdvertisementStatus;
}
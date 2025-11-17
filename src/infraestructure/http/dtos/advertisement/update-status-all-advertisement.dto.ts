import { IsArray, IsEnum, IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { AdvertisementStatus } from '../../../../domain/entities/advertisement';
import { ApiProperty } from "@nestjs/swagger";
import { AdvertisementIsStatusValid } from "../../validators/advertisement/advertisement-is-status-valid.validator";
import { Type } from "class-transformer";

export class UpdateStatusAllAdvertisementDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'invalid.id.should.not.be.empty' })
    @IsString({ message: 'invalid.id.must.be.a.string' })
    id: string;
}

export class UpdateStatusAllAdvertisementsDto {
    @ApiProperty({ type: [UpdateStatusAllAdvertisementDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateStatusAllAdvertisementDto)
    advertisements: UpdateStatusAllAdvertisementDto[];

    @ApiProperty()
    //@AdvertisementIsStatusValid()
    @IsEnum(AdvertisementStatus, { message: 'invalid.status.must.be.one.of.the.following.values.ACTIVE.INACTIVE.PAUSED_BY_USER.PAUSED_BY_APPLICATION.WAITING_FOR_APPROVAL' })
    status: AdvertisementStatus;
}
import { IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { UserStatus } from "../interfaces/user.interface";

export class UpdateStatusUserDto {
    @ApiProperty()
    @IsEnum(UserStatus, { message: 'invalid.status.must.be.one.of.the.following.values.ACTIVE.INACTIVE' })
    status: UserStatus;
}
import { IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { UserStatus } from "src/domain/entities/user";
import { Property } from "src/infraestructure/decorators/property.decorator";

export class UpdateStatusUserDto {
    @ApiProperty()
    @IsEnum(UserStatus, { message: 'invalid.status.must.be.one.of.the.following.values.ACTIVE.INACTIVE' })
    @Property()
    status: UserStatus;
}
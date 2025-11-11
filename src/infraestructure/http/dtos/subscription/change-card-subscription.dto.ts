import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsObject } from "class-validator";
import { Property } from "src/infraestructure/decorators/property.decorator";

export class ChangeCardSubscriptionDto {

    @ApiProperty()
    @IsObject()
    @IsNotEmpty()
    @Property()
    paymentData: Record<string, any>;
}
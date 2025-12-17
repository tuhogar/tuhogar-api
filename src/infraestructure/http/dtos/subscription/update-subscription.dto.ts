import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty, IsObject } from "class-validator";
import { IsExistingPlan } from "src/infraestructure/http/validators/plan/is-existing-plan.validator";
import { Property } from "src/infraestructure/decorators/property.decorator";

export class UpdateSubscriptionDto {

    @ApiProperty()
    @IsMongoId({ message: 'invalid.planId' })
    @IsExistingPlan()
    @Property()
    planId: string;

    @ApiProperty()
    @IsObject()
    @IsNotEmpty()
    @Property()
    paymentData: Record<string, any>;
}
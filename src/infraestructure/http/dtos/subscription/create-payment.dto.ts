import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty, IsString } from "class-validator";
import { IsExistingPlan } from "src/infraestructure/http/validators/plan/is-existing-plan.validator";
import { Property } from "src/infraestructure/decorators/property.decorator";

export class CreatePaymentDto {

    @ApiProperty()
    @IsMongoId({ message: 'invalid.planId' })
    @IsExistingPlan()
    @Property()
    planId: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @Property()
    token: string;
}
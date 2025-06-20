import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsJSON, IsMongoId, IsNotEmpty, IsObject, IsOptional, IsString, MaxLength } from "class-validator";
import { IsExistingPlan } from "src/infraestructure/http/validators/plan/is-existing-plan.validator";
import { Property } from "src/infraestructure/decorators/property.decorator";
import { AccountDocumentType } from "src/domain/entities/account";

export class CreateSubscriptionDto {

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
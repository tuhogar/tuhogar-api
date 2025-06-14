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

    @ApiPropertyOptional()
    @IsOptional()
    @IsEnum(AccountDocumentType, { message: 'invalid.documentType.must.be.one.of.the.following.values.CC.CE.NIT' })
    @Property()
    documentType?: AccountDocumentType;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString({ message: 'invalid.documentNumber.must.be.a.string' })
    @MaxLength(30, { message: 'invalid.documentNumber.must.be.shorter.than.or.equal.to.30.characters' })
    @Property()
    documentNumber?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString({ message: 'invalid.coupon.must.be.a.string' })
    @Property()
    coupon?: string;

    @ApiProperty()
    @IsObject()
    @IsNotEmpty()
    @Property()
    paymentData: Record<string, any>;
}
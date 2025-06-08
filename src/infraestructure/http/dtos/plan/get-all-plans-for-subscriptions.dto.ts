import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ArrayMinSize, IsArray, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";
import { Property } from "src/infraestructure/decorators/property.decorator";

export class GetAllPlansForSubscriptionsDto {
    @ApiPropertyOptional()
    @IsString({ message: 'invalid.coupon.must.be.a.string' })
    @IsOptional()
    @Property()
    coupon?: string;
}
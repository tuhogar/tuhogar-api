import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { Property } from "src/infraestructure/decorators/property.decorator";

export class ApplyCouponDto {
    @ApiProperty()
    @IsNotEmpty({ message: 'invalid.coupon.should.not.be.empty' })
    @IsString({ message: 'invalid.coupon.must.be.a.string' })
    @Property()
    coupon: string;
}
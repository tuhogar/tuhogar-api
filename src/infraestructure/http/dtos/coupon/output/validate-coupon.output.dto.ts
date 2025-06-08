import { ApiProperty } from '@nestjs/swagger';

export class ValidateCouponOutputDto {
  @ApiProperty({
    description: 'Cupom',
    example: '1234567890',
    required: true,
    nullable: false
  })
  coupon: string;

  @ApiProperty({
    description: 'Tipo do cupom',
    example: 'DOCUMENT',
    required: false,
    nullable: true
  })
  type: string;
}

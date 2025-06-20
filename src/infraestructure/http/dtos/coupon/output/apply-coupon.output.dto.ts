import { ApiProperty } from '@nestjs/swagger';

export class ApplyCouponOutputDto {
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

  @ApiProperty({
    description: 'Data de expiração do cupom',
    example: '2025-06-20T10:21:28.000Z',
    required: false,
    nullable: true
  })
  expirationDate: Date;
}

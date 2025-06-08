import { Plan } from 'src/domain/entities/plan';
import { ValidateCouponOutputDto } from '../validate-coupon.output.dto';
import { Coupon } from 'src/domain/entities/coupon';

/**
 * Mapeador responsável por converter a entidade Coupon para o DTO de saída ValidateCouponOutputDto
 */
export class ValidateCouponOutputDtoMapper {
  /**
   * Converte uma entidade Coupon para o DTO de saída ValidateCouponOutputDto
   * @param coupon Entidade Coupon a ser convertida
   * @returns DTO de saída ValidateCouponOutputDto
   */
  public static toOutputDto(coupon: Coupon): ValidateCouponOutputDto {
    if (!coupon) return null;
    
    return {
      coupon: coupon.coupon,
      type: coupon.type,
    };
  }
}

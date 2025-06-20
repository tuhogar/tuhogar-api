import { ApplyCouponOutputDto } from '../apply-coupon.output.dto';
import { Coupon } from 'src/domain/entities/coupon';

/**
 * Mapeador responsável por converter a entidade Coupon para o DTO de saída ApplyCouponOutputDto
 */
export class ApplyCouponOutputDtoMapper {
  /**
   * Converte uma entidade Coupon para o DTO de saída ApplyCouponOutputDto
   * @param coupon Entidade Coupon a ser convertida
   * @returns DTO de saída ApplyCouponOutputDto
   */
  public static toOutputDto(coupon: Coupon): ApplyCouponOutputDto {
    if (!coupon) return null;
    
    return {
      coupon: coupon.coupon,
      type: coupon.type,
      expirationDate: coupon.expirationDate,
    };
  }
}

import { Coupon } from "src/domain/entities/coupon";

export abstract class ICouponRepository {
    abstract findOneByCoupon(coupon: string): Promise<Coupon>
    abstract apply(id: string): Promise<void>
}
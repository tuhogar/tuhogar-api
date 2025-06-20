import { AccountCoupon } from "src/domain/entities/account-coupon";

export abstract class IAccountCouponRepository {
    abstract create(accountCoupon: AccountCoupon): Promise<AccountCoupon>
    abstract findLastNotusedByAccountId(accountId: string): Promise<AccountCoupon>
    abstract use(accountCouponId: string): Promise<void>
}
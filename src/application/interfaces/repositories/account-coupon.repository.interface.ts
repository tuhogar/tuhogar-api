import { AccountCoupon } from "src/domain/entities/account-coupon";

export abstract class IAccountCouponRepository {
    abstract create(accountCoupon: AccountCoupon): Promise<AccountCoupon>
    abstract findLastNotDepletedByAccountId(accountId: string): Promise<AccountCoupon>
    abstract deplete(accountCouponId: string): Promise<void>
    abstract findTypeDocumentCouponByAccountId(accountId: string): Promise<AccountCoupon | null>
}
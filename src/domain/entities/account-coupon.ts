import { Coupon } from "./coupon";

export class AccountCoupon {
    id?: string;
    accountId: string;
    couponId: string;
    coupon?: Coupon;
    isDepleted: boolean;

    constructor(props: AccountCoupon) {
        Object.assign(this, props);
    }
}
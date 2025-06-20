import { Coupon } from "./coupon";

export enum CouponType {
    DOCUMENT = 'DOCUMENT',
}

export class AccountCoupon {
    id?: string;
    accountId: string;
    couponId: string;
    used: boolean;
    coupon?: Coupon;

    constructor(props: AccountCoupon) {
        Object.assign(this, props);
    }
}
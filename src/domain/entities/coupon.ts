import { Plan } from "./plan";

export enum CouponType {
    DOCUMENT = 'DOCUMENT',
}

export class Coupon {
    id?: string;
    coupon: string;
    type: CouponType;
    isSingleRedemption: boolean;
    doesNotHavePaidPlanIds: Plan[];
    hasPaidPlanIds: Plan[];
    expirationDate: Date;
    isRedeemed: boolean;
    allowRepeatedFulfillment: boolean;

    constructor(props: Coupon) {
        Object.assign(this, props);
    }
}
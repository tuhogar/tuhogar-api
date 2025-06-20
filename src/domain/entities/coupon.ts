import { Plan } from "./plan";

export enum CouponType {
    DOCUMENT = 'DOCUMENT',
}

export class Coupon {
    id?: string;
    coupon: string;
    type: CouponType;
    singleUse: boolean;
    doesNotHavePaidPlanIds: Plan[];
    hasPaidPlanIds: Plan[];
    expirationDate: Date;
    singleUseApplied: boolean;

    constructor(props: Coupon) {
        Object.assign(this, props);
    }
}
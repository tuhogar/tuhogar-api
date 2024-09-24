import { Document } from 'mongoose';

export class AdvertisementReport {
    _id?: string;
    id?: string;
    advertisementId: string;
    advertisementReasonId: string;

    constructor(props: AdvertisementReport) {
        Object.assign(this, props);
    }
}
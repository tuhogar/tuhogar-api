import { Document } from 'mongoose';

export class AdvertisementReport {
    id?: string;
    advertisementId: string;
    advertisementReasonId: string;

    constructor(props: AdvertisementReport) {
        Object.assign(this, props);
    }
}
import { Document } from 'mongoose';

export enum AdvertisementStatus {
    ACTIVE = 'ACTIVE',
}

export interface Advertisement extends Document  {
    readonly accountId: string;
    readonly userId: string;
    readonly description: string;
    readonly status: AdvertisementStatus,
}
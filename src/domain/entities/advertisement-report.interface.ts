import { Document } from 'mongoose';

export interface AdvertisementReport extends Document  {
    readonly advertisementId: string;
    readonly advertisementReasonId: string;
}
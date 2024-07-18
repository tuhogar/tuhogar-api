import { Document } from 'mongoose';

export interface AdvertisementReason extends Document  {
    readonly name: string;
}
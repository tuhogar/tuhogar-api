import { Document } from 'mongoose';

export interface AdvertisementCode extends Document  {
    readonly code: number;
}
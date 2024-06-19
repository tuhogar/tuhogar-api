import { Document } from 'mongoose';

export interface BulkUpdateDate extends Document  {
    readonly updatedAt: Date;
}
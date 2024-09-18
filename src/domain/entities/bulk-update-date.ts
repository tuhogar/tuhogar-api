import { Document } from 'mongoose';

export class BulkUpdateDate {
    _id?: string;
    updatedAt: Date;

    constructor(props: BulkUpdateDate) {
        Object.assign(this, props);
    }
}
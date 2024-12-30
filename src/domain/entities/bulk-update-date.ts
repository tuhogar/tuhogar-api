import { Document } from 'mongoose';

export class BulkUpdateDate {
    id?: string;
    updatedAt: Date;

    constructor(props: BulkUpdateDate) {
        Object.assign(this, props);
    }
}
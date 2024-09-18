import { Document } from 'mongoose';

export class Amenity {
    _id?: string;
    key: string;
    name: string;

    constructor(props: Amenity) {
        Object.assign(this, props);
    }
}
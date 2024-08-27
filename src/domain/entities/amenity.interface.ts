import { Document } from 'mongoose';

export interface Amenity extends Document  {
    readonly key: string;
    readonly name: string;
}
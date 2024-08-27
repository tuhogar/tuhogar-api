import { Document } from 'mongoose';

export interface Plan extends Document  {
    readonly name: string,
    readonly description: string,
    readonly price: number,
}
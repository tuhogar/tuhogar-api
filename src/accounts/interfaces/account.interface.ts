import { Document } from 'mongoose';

export enum AccountStatus {
    ACTIVE = 'ACTIVE',
}

export interface Account extends Document  {
    readonly planId: string,
    readonly status: AccountStatus,
}
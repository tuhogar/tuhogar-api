import { Document } from 'mongoose';

export enum AccountStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

export interface Account extends Document  {
    readonly planId: string,
    readonly status: AccountStatus,
}
import { Document } from 'mongoose';

export enum UserStatus {
    ACTIVE = 'ACTIVE',
}

export enum UserRole {
    ADMIN = 'ADMIN',
    USER = 'USER',
    MASTER = 'MASTER',
}

export interface User extends Document  {
    readonly name: string,
    readonly email: string,
    readonly accountId: string,
    readonly userRole: UserRole,
    readonly status: UserStatus,
    readonly uid: string;
}
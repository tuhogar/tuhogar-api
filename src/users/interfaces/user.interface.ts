import { Document } from 'mongoose';

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

export enum UserRole {
    ADMIN = 'ADMIN',
    USER = 'USER',
    MASTER = 'MASTER',
}

export interface User extends Document  {
    readonly name: String,
    readonly email: String,
    readonly accountId: String,
    readonly userRole: UserRole,
    readonly status: UserStatus,
    readonly uid: String;
}
import { Document } from 'mongoose';
import { Advertisement } from 'src/advertisements/interfaces/advertisement.interface';

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
    readonly name: string,
    readonly email: string,
    readonly accountId: string,
    readonly userRole: UserRole,
    readonly status: UserStatus,
    readonly uid: string;
    readonly phone: string;
    readonly whatsApp: string;
    readonly advertisementFavorites: Advertisement[];
}
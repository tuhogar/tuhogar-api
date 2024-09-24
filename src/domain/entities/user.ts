import { Account } from './account';
import { Advertisement } from './advertisement';

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

export enum UserRole {
    ADMIN = 'ADMIN',
    USER = 'USER',
    MASTER = 'MASTER',
}

export class User {
    id?: string;
    name: string;
    email: string;
    accountId: string;
    userRole: UserRole;
    status: UserStatus;
    uid: string;
    phone: string;
    whatsApp: string;
    advertisementFavorites: Advertisement[];
    account: Account;

    constructor(props: User) {
        Object.assign(this, props);
    }
}
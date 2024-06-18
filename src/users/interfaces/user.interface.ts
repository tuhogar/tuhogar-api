import { Document } from 'mongoose';
import { Address } from 'src/addresses/intefaces/address.interface';

export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

export enum UserRole {
    ADMIN = 'ADMIN',
    USER = 'USER',
    MASTER = 'MASTER',
}

export enum UserDocumentType {
    CC = 'CC',
    CE = 'CE',
    NIT = 'NIT',
}
export interface UserSocialMedia {
    readonly youtube: string;
    readonly tiktok: string;
    readonly instagram: string;
    readonly twitter: string;
    readonly facebook: string;
}

export interface User extends Document  {
    readonly name: string,
    readonly email: string,
    readonly accountId: string,
    readonly userRole: UserRole,
    readonly status: UserStatus,
    readonly uid: string;
    readonly documentType: UserDocumentType;
    readonly documentNumber: string;
    readonly address: Address;
    readonly phone: string;
    readonly whatsApp: string;
    readonly webSite: string;
    readonly socialMedia: UserSocialMedia;
    readonly description: string;
    readonly photo: string;
}
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
    readonly name: String,
    readonly email: String,
    readonly accountId: String,
    readonly userRole: UserRole,
    readonly status: UserStatus,
    readonly uid: String;
    readonly documentType: UserDocumentType;
    readonly documentNumber: String;
    readonly address: Address;
    readonly phone: String;
    readonly whatsApp: String;
    readonly webSite: String;
    readonly socialMedia: UserSocialMedia;
}
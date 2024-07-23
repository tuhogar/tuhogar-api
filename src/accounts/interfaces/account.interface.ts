import { Address } from 'cluster';
import { Document } from 'mongoose';
import { SocialMedia } from 'src/social-media/interfaces/social-media.inteface';

export enum AccountStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

export enum AccountDocumentType {
    CC = 'CC',
    CE = 'CE',
    NIT = 'NIT',
}

export interface Account extends Document  {
    readonly planId: string,
    readonly photo: string;

    readonly name: string,
    readonly email: string,
    readonly address: Address;
    readonly phone: string;
    readonly whatsApp: string;
    readonly webSite: string;
    readonly socialMedia: SocialMedia;
    readonly description: string;
    readonly documentType: AccountDocumentType;
    readonly documentNumber: string;
    
    readonly status: AccountStatus,
}
import { Address } from './address';
import { ContractType } from './contract-type';
import { SocialMedia } from './social-media';

export enum AccountStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

export enum AccountDocumentType {
    CC = 'CC',
    CE = 'CE',
    NIT = 'NIT',
}

export class Account {
    id?: string;
    planId: string;
    photo: string;
    name: string;
    email: string;
    address: Address;
    phone: string;
    whatsApp: string;
    webSite: string;
    socialMedia: SocialMedia;
    description: string;
    documentType: AccountDocumentType;
    documentNumber: string;
    contractTypes?: ContractType[];
    status: AccountStatus;

    constructor(props: Account) {
        Object.assign(this, props);
    }
}
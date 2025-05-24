import { Address } from './address';
import { ContractType } from './contract-type';
import { SocialMedia } from './social-media';
import { Subscription } from './subscription';

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
    photo?: string;
    name: string;
    email: string;
    address?: Address;
    phone: string;
    whatsApp?: string;
    phone2?: string;
    whatsApp2?: string;
    webSite?: string;
    socialMedia?: SocialMedia;
    description?: string;
    documentType: AccountDocumentType;
    documentNumber: string;
    contractTypes?: ContractType[];
    subscription?: Subscription;
    subscriptions?: Subscription[];
    status: AccountStatus;
    /**
     * Indica se o usuário já assinou algum plano pago
     * Esta propriedade é usada para identificar usuários que já foram clientes pagantes
     * mesmo que atualmente estejam em um plano gratuito
     */
    hasPaidPlan?: boolean;

    constructor(props: Account) {
        Object.assign(this, props);
    }
}
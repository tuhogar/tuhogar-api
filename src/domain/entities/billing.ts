import { AccountDocumentType } from "./account";

export class Billing {
    id?: string;
    public accountId: string;
    public name: string;
    public email: string;
    public phone: string;
    public address?: string;
    public documentType?: AccountDocumentType;
    public documentNumber?: string;

    constructor(props: Billing) {
        Object.assign(this, props);
    }
}
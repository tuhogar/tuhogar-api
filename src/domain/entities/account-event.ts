export class AccountEvent {
    id?: string;
    accountId: string;
    type: string;
    count: number

    constructor(props: AccountEvent) {
        Object.assign(this, props);
    }
}
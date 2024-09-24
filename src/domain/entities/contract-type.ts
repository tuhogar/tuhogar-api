export class ContractType {
    id?: string;
    key: string;
    name: string;

    constructor(props: ContractType) {
        Object.assign(this, props);
    }
}
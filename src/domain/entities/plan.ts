export class Plan {
    id?: string;
    name: string;
    duration: number;
    items: string[];
    price: number;

    constructor(props: Plan) {
        Object.assign(this, props);
    }
}
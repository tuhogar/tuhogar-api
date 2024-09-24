export class Plan {
    _id?: string;
    id?: string;
    name: string;
    duration: number;
    items: string[];
    price: number;

    constructor(props: Plan) {
        Object.assign(this, props);
    }
}
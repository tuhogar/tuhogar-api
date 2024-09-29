export class Plan {
    id?: string;
    name: string;
    duration: number;
    items: string[];
    price: number;
    photo?: string;

    constructor(props: Plan) {
        Object.assign(this, props);
    }
}
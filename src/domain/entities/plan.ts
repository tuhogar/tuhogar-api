export class Plan {
    id?: string;
    name: string;
    duration: number;
    items: string[];
    price: number;
    photo?: string;
    externalId: string;
    maxAdvertisements?: number;
    maxPhotos?: number;

    constructor(props: Plan) {
        Object.assign(this, props);
    }
}
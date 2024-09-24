export class AdvertisementReason {
    _id?: string;
    id?: string;
    name: string;

    constructor(props: AdvertisementReason) {
        Object.assign(this, props);
    }
}
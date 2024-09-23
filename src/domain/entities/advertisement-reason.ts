export class AdvertisementReason {
    id?: string;
    name: string;

    constructor(props: AdvertisementReason) {
        Object.assign(this, props);
    }
}
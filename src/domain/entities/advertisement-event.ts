export class AdvertisementEvent {
    id?: string;
    advertisementId: string;
    type: string;
    count: number

    constructor(props: AdvertisementEvent) {
        Object.assign(this, props);
    }
}
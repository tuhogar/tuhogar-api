export class Address {
    country: string;
    state: string;
    city: string;
    neighbourhood: string;
    street: string;
    stateSlug: string;
    citySlug: string;
    neighbourhoodSlug: string;
    latitude: number;
    longitude: number;
    postalCode: string;
    placeId: string;
    establishment: string;

    constructor(props: Address) {
        Object.assign(this, props);
    }
}
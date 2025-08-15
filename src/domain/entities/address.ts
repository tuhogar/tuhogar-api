export class Address {
    country: string;
    state: string;
    city: string;
    sector: string;
    neighbourhood: string;
    street: string;
    stateSlug: string;
    citySlug: string;
    sectorSlug: string;
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
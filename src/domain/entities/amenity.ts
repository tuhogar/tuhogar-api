export class Amenity {
    _id?: string;
    id?: string;
    key: string;
    name: string;

    constructor(props: Amenity) {
        Object.assign(this, props);
    }
}
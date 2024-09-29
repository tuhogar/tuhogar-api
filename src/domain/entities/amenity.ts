export class Amenity {
    id?: string;
    key: string;
    name: string;
    phosphorIcon: string;
    type: string[];

    constructor(props: Amenity) {
        Object.assign(this, props);
    }
}
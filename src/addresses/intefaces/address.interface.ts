export interface Address {
    readonly country: string;
    readonly state: string;
    readonly city: string;
    readonly neighbourhood: string;
    readonly street: string;
    readonly stateSlug: string;
    readonly citySlug: string;
    readonly neighbourhoodSlug: string;
    readonly latitude: number;
    readonly longitude: number;
}
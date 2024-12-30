export class SocialMedia {
    youtube: string;
    tiktok: string;
    instagram: string;
    twitter: string;
    facebook: string;

    constructor(props: SocialMedia) {
        Object.assign(this, props);
    }
}
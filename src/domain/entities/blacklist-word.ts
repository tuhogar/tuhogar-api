export class BlacklistWord {
    id?: string;
    word: string;

    constructor(props: BlacklistWord) {
        Object.assign(this, props);
    }
}
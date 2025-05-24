export class Plan {
    id?: string;
    name: string;
    /**
     * Número de dias gratuitos no período de teste da assinatura
     * Opcional: se não for fornecido, o plano não terá período gratuito
     */
    freeTrialDays?: number;
    items: string[];
    price: number;
    photo?: string;
    externalId: string;
    maxAdvertisements?: number;
    maxPhotos?: number;

    constructor(props: Plan) {
        Object.assign(this, props);
    }
}
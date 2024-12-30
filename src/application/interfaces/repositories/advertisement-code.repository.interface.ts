import { AdvertisementCode } from "src/domain/entities/advertisement-code";

export abstract class IAdvertisementCodeRepository {
    abstract  generateNewCode(): Promise<AdvertisementCode>
}
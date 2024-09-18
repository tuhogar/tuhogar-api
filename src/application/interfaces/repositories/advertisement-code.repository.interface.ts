import { AdvertisementCode } from "src/domain/entities/advertisement-code";

export abstract class IAdvertisementCodeRepository {
    abstract  findOneAndUpdate(): Promise<AdvertisementCode>
}
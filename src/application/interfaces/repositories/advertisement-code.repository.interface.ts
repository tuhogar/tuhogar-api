export abstract class IAdvertisementCodeRepository {
    abstract  findOneAndUpdate(): Promise<number>
}
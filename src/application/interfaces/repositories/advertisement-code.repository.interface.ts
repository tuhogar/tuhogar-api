export abstract class IAdvertisementCodeRepository {
    abstract  generate(): Promise<number>
}
import { Amenity } from "src/domain/entities/amenity.interface";

export abstract class IAmenityRepository {
    abstract find(): Promise<Amenity[]>
    abstract findById(amenityId: string): Promise<Amenity>
}
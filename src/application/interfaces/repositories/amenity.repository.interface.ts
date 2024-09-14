import { Amenity } from "src/domain/entities/amenity.interface";

export abstract class IAmenityRepository {
    abstract getAll(): Promise<Amenity[]>
    abstract findById(amenityId: string): Promise<Amenity>
}
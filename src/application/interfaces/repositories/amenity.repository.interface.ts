import { Amenity } from "src/domain/entities/amenity";

export abstract class IAmenityRepository {
    abstract find(): Promise<Amenity[]>
    abstract findById(id: string): Promise<Amenity>
}
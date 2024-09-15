import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Amenity as AmenityMongoose } from "../entities/amenity.entity"
import { IAmenityRepository } from "src/application/interfaces/repositories/amenity.repository.interface";
import { Amenity } from "src/domain/entities/amenity.interface";

export class MongooseAmenityRepository implements IAmenityRepository {
    constructor(
        @InjectModel(AmenityMongoose.name) private readonly amenityModel: Model<AmenityMongoose>,
    ) {}
    
    async find(): Promise<any[]> {
        return this.amenityModel.find().sort({ name: 1 }).exec();
    }

    async findById(amenityId: string): Promise<any> {
        return this.amenityModel.findById(amenityId).exec();
    }
}
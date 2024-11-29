import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Amenity as AmenityMongoose } from "../entities/amenity.entity"
import { IAmenityRepository } from "src/application/interfaces/repositories/amenity.repository.interface";
import { Amenity } from "src/domain/entities/amenity";
import { MongooseAmenityMapper } from "../mapper/mongoose-amenity.mapper";

export class MongooseAmenityRepository implements IAmenityRepository {
    constructor(
        @InjectModel(AmenityMongoose.name) private readonly amenityModel: Model<AmenityMongoose>,
    ) {}
    
    async find(): Promise<Amenity[]> {
        const query = await this.amenityModel.find().sort({ name: 1 }).exec();
        return query.map((item) => MongooseAmenityMapper.toDomain(item));
    }

    async findOneById(id: string): Promise<Amenity> {
        const query = await this.amenityModel.findById(id).exec();
        return MongooseAmenityMapper.toDomain(query);
    }
}
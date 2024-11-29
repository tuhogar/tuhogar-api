import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AdvertisementReason as AdvertisementReasonMongoose } from "../entities/advertisement-reason.entity"
import { IAdvertisementReasonRepository } from "src/application/interfaces/repositories/advertisement-reason.repository.interface";
import { AdvertisementReason } from "src/domain/entities/advertisement-reason";
import { MongooseAdvertisementReasonMapper } from "../mapper/mongoose-advertisement-reason.mapper";

export class MongooseAdvertisementReasonRepository implements IAdvertisementReasonRepository {
    constructor(
        @InjectModel(AdvertisementReasonMongoose.name) private readonly advertisementReasonModel: Model<AdvertisementReasonMongoose>,
    ) {}
    
    async findOneById(id: string): Promise<AdvertisementReason> {
        const query = await this.advertisementReasonModel.findById(id).exec();
        return MongooseAdvertisementReasonMapper.toDomain(query);
    }
    
    async find(): Promise<AdvertisementReason[]> {
        const query = await this.advertisementReasonModel.find().sort({ name: 1 }).exec();
        return query.map((item) => MongooseAdvertisementReasonMapper.toDomain(item));
    }
    
    async create(advertisementReason: AdvertisementReason): Promise<AdvertisementReason> {
        const data = MongooseAdvertisementReasonMapper.toMongoose(advertisementReason);
        const entity = new this.advertisementReasonModel({ ...data });
        await entity.save();

        return MongooseAdvertisementReasonMapper.toDomain(entity);
    }
    
    async delete(id: string): Promise<void> {
        await this.advertisementReasonModel.deleteOne({ _id: id }).exec();
    }
    
    async update(id: string, advertisementReason: AdvertisementReason): Promise<AdvertisementReason> {
        const data = MongooseAdvertisementReasonMapper.toMongoose(advertisementReason);

        const updated = await this.advertisementReasonModel.findOneAndUpdate({ 
            _id: id
        },
        advertisementReason,
        { new: true }
        ).exec();

        if (updated) {
            return MongooseAdvertisementReasonMapper.toDomain(updated);
        }

        return null;
    }
}
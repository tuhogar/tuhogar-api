import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AdvertisementReason as AdvertisementReasonMongoose } from "../entities/advertisement-reason.entity"
import { IAdvertisementReasonRepository } from "src/application/interfaces/repositories/advertisement-reason.repository.interface";
import { AdvertisementReason } from "src/domain/entities/advertisement-reason.interface";
import { CreateUpdateAdvertisementReasonDto } from "src/infraestructure/http/dtos/advertisement-reason/create-update-advertisement-reason.dto";

export class MongooseAdvertisementReasonRepository implements IAdvertisementReasonRepository {
    constructor(
        @InjectModel(AdvertisementReasonMongoose.name) private readonly advertisementReasonModel: Model<AdvertisementReasonMongoose>,
    ) {}
    
    async getAll(): Promise<any[]> {
        return this.advertisementReasonModel.find().sort({ name: 1 }).exec();
    }
    
    async create(createUpdateAdvertisementReasonDto: CreateUpdateAdvertisementReasonDto): Promise<void> {
        await this.advertisementReasonModel.create(createUpdateAdvertisementReasonDto);
    }
    
    async delete(advertisementReasonId: string): Promise<void> {
        await this.advertisementReasonModel.deleteOne({ _id: advertisementReasonId }).exec();
    }
    
    async update(advertisementReasonId: string, createUpdateAdvertisementReasonDto: CreateUpdateAdvertisementReasonDto): Promise<any> {
        return await this.advertisementReasonModel.findOneAndUpdate({ 
            _id: advertisementReasonId
        },
        createUpdateAdvertisementReasonDto,
        { new: true }
        ).exec();
    }
}
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AdvertisementReport as AdvertisementReportMongoose } from "../entities/advertisement-report.entity"
import { IAdvertisementReportRepository } from "src/application/interfaces/repositories/advertisement-report.repository.interface";
import { AdvertisementReport } from "src/domain/entities/advertisement-report";
import { MongooseAdvertisementReportMapper } from "../mapper/mongoose-advertisement-report.mapper";

export class MongooseAdvertisementReportRepository implements IAdvertisementReportRepository {
    constructor(
        @InjectModel(AdvertisementReportMongoose.name) private readonly advertisementReportModel: Model<AdvertisementReportMongoose>,
    ) {}
    
    async findByAdvertisementId(advertisementId: string): Promise<AdvertisementReport[]> {
        const query = await this.advertisementReportModel.find({ advertisementId }).exec();
        return query.map((item) => MongooseAdvertisementReportMapper.toDomain(item));
    }
    
    async create(advertisementReport: AdvertisementReport): Promise<AdvertisementReport> {
        const data = MongooseAdvertisementReportMapper.toMongoose(advertisementReport);
        const entity = new this.advertisementReportModel({ ...data });
        await entity.save();

        return MongooseAdvertisementReportMapper.toDomain(entity);
    }
    
    async deleteOne(id: string): Promise<void> {
        await this.advertisementReportModel.deleteOne({ _id: id }).exec();
    }
}
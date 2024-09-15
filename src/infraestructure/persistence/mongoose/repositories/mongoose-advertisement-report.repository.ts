import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AdvertisementReport as AdvertisementReportMongoose } from "../entities/advertisement-report.entity"
import { IAdvertisementReportRepository } from "src/application/interfaces/repositories/advertisement-report.repository.interface";
import { AdvertisementReport } from "src/domain/entities/advertisement-report.interface";
import { CreateAdvertisementReportDto } from "src/infraestructure/http/dtos/advertisement-report/create-advertisement-report.dto";

export class MongooseAdvertisementReportRepository implements IAdvertisementReportRepository {
    constructor(
        @InjectModel(AdvertisementReportMongoose.name) private readonly advertisementReportModel: Model<AdvertisementReportMongoose>,
    ) {}
    
    async find(advertisementId: string): Promise<any[]> {
        return this.advertisementReportModel.find({ advertisementId }).populate('advertisementReasonId').exec();
    }
    
    async create(createAdvertisementReportDto: CreateAdvertisementReportDto): Promise<{ id: string; }> {
        const advertisementReportCreated = new this.advertisementReportModel(createAdvertisementReportDto);
        await advertisementReportCreated.save();

        return { id: advertisementReportCreated._id.toString() };
    }
    
    async deleteOne(advertisementReportId: string): Promise<void> {
        await this.advertisementReportModel.deleteOne({ _id: advertisementReportId }).exec();
    }
}
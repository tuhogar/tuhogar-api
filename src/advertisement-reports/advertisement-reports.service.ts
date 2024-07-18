import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdvertisementReport } from './interfaces/advertisement-reports.interface';
import { CreateAdvertisementReportDto } from './dtos/create-advertisement-report.dto';

@Injectable()
export class AdvertisementReportsService {
    constructor(
        @InjectModel('AdvertisementReport') private readonly advertisementReportModel: Model<AdvertisementReport>,
    ) {}

    async create(
        createAdvertisementReportDto: CreateAdvertisementReportDto,
    ): Promise<{ id: string }> {
        const advertisementReportCreated = new this.advertisementReportModel(createAdvertisementReportDto);
        await advertisementReportCreated.save();

        return { id: advertisementReportCreated._id.toString() };
    }

    async getByAdvertisementId(advertisementId: string): Promise<AdvertisementReport[]> {
        return this.advertisementReportModel.find({ advertisementId }).populate('advertisementReasonId').exec();
    }

    async delete(advertisementReportId: string): Promise<void> {
        await this.advertisementReportModel.deleteOne({ _id: advertisementReportId }).exec();
    }
}

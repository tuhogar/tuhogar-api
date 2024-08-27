import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdvertisementReport } from 'src/domain/entities/advertisement-report.interface';
import { CreateAdvertisementReportDto } from 'src/infraestructure/http/dtos/advertisement-report/create-advertisement-report.dto';

@Injectable()
export class AdvertisementReportService {
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
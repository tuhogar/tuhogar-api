import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AdvertisementReason } from './interfaces/advertisement-reasons.interface';
import { CreateUpdateAdvertisementReasonDto } from './dtos/create-update-advertisement-reason.dto';

@Injectable()
export class AdvertisementReasonsService {
    constructor(
        @InjectModel('AdvertisementReason') private readonly advertisementReasonModel: Model<AdvertisementReason>,
    ) {}

    async getAll(): Promise<AdvertisementReason[]> {
        return this.advertisementReasonModel.find().sort({ name: 1 }).exec();
    }

    async create(createUpdateAdvertisementReasonDto: CreateUpdateAdvertisementReasonDto): Promise<void> {
        await this.advertisementReasonModel.create(createUpdateAdvertisementReasonDto);
    }

    async delete(advertisementReasonId: string): Promise<void> {
        await this.advertisementReasonModel.deleteOne({ _id: advertisementReasonId }).exec();
    }

    async update(
        advertisementReasonId: string,
        createUpdateAdvertisementReasonDto: CreateUpdateAdvertisementReasonDto,
    ): Promise<{ id: string }> {

        const updatedAdvertisementReason = await this.advertisementReasonModel.findOneAndUpdate({ 
            _id: advertisementReasonId
        },
        createUpdateAdvertisementReasonDto,
        { new: true }
        ).exec();

        if (!updatedAdvertisementReason) throw new Error('notfound.advertisement.do.not.exists');

        return { id: updatedAdvertisementReason._id.toString() };
    }
    
}

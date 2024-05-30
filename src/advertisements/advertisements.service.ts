import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Advertisement, AdvertisementStatus } from './interfaces/advertisement.interface';
import { InjectModel } from '@nestjs/mongoose';
import { AuthenticatedUser } from 'src/users/interfaces/authenticated-user.interface';
import { CreateAdvertisementDto } from './dtos/create-advertisement.dto';

@Injectable()
export class AdvertisementsService {
    constructor(
        @InjectModel('Advertisement') private readonly advertisementModel: Model<Advertisement>,
    ) {}

    async create(accountId: string, userId: string, description: string): Promise<void> {
        const advertisementCreated = new this.advertisementModel({
            accountId: accountId,
            userId: userId,
            description,
            status: AdvertisementStatus.ACTIVE,
        });
        await advertisementCreated.save();
    }

    async getAllByAccountId(accountId: string): Promise<Advertisement[]> {
        return this.advertisementModel.find({ accountId }).exec();
    }
}

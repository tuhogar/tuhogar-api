import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Advertisement, AdvertisementAmenity, AdvertisementPropertyStatus, AdvertisementPropertyType, AdvertisementStatus, AdvertisementTransactionType } from './interfaces/advertisement.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Address } from 'src/addresses/intefaces/address.interface';

@Injectable()
export class AdvertisementsService {
    constructor(
        @InjectModel('Advertisement') private readonly advertisementModel: Model<Advertisement>,
    ) {}

    async create(
        accountId: string, 
        userId: string, 
        description: string,
        transactionType: AdvertisementTransactionType,
        propertyStatus: AdvertisementPropertyStatus,
        propertyType: AdvertisementPropertyType,
        allContentsIncluded: boolean,
        isResidentialComplex: boolean,
        isPenthouse: boolean,
        bedsCount: Number,
        bathsCount: Number,
        parkingCount: Number,
        floorsCount: Number,
        constructionYear: Number,
        socioEconomicLevel: Number,
        isHoaIncluded: boolean,
        amenities: AdvertisementAmenity[],
        hoaFee: Number,
        lotArea: Number,
        floorArea: Number,
        price: Number,
        pricePerFloorArea: Number,
        pricePerLotArea: Number,
        address: Address,
        tourUrl: string,
        videoUrl: string,
        isActive: boolean,
        isPaid: boolean,
    ): Promise<void> {
        const advertisementCreated = new this.advertisementModel({
            accountId: accountId,
            userId: userId,
            description,
            status: AdvertisementStatus.ACTIVE,
            transactionType,
            propertyStatus,
            propertyType,
            allContentsIncluded,
            isResidentialComplex,
            isPenthouse,
            bedsCount,
            bathsCount,
            parkingCount,
            floorsCount,
            constructionYear,
            socioEconomicLevel,
            isHoaIncluded,
            amenities,
            hoaFee,
            lotArea,
            floorArea,
            price,
            pricePerFloorArea,
            pricePerLotArea,
            address,
            tourUrl,
            videoUrl,
            isActive,
            isPaid,
        });
        await advertisementCreated.save();
    }

    async getAllByAccountId(accountId: string): Promise<Advertisement[]> {
        return this.advertisementModel.find({ accountId }).exec();
    }
}

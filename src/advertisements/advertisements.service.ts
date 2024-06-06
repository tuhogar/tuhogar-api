import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Advertisement, AdvertisementAmenity, AdvertisementPropertyStatus, AdvertisementPropertyType, AdvertisementStatus, AdvertisementTransactionType } from './interfaces/advertisement.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Address } from 'src/addresses/intefaces/address.interface';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';

export const imageFileFilter = (req, file, callback) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
      return callback(new BadRequestException('Only image files are allowed!'), false);
    }
    callback(null, true);
  };
  
 export const editFileName = (req, file, callback) => {
    const fileExtName = extname(file.originalname);
    const randomName = uuidv4();
    callback(null, `${req.params.advertisementid}-${randomName}${fileExtName}`);
  };
  
@Injectable()
export class AdvertisementsService {
    private advertisementImagesUrl: string;
    constructor(
        private configService: ConfigService,
        @InjectModel('Advertisement') private readonly advertisementModel: Model<Advertisement>,
    ) {
        this.advertisementImagesUrl = this.configService.get<string>('ADVERTISEMENT_IMAGES_URL');
    }

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

    async updloadImage(advertisementid: string, fileName: string): Promise<void> {
        const photoUrl = `${this.advertisementImagesUrl}/${fileName}`;

        const updatedAdvertisement = await this.advertisementModel.findByIdAndUpdate(advertisementid,
            { $push: { photos: photoUrl }},
            { new: true }
        ).exec();

        if (!updatedAdvertisement) throw new NotFoundException('notfound.advertisement.do.not.exists');
    }
}
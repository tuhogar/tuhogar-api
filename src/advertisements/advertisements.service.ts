import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Advertisement, AdvertisementAmenity, AdvertisementPropertyStatus, AdvertisementPropertyType, AdvertisementStatus, AdvertisementTransactionType } from './interfaces/advertisement.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Address } from 'src/addresses/intefaces/address.interface';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { UpdateImagesOrdersAdvertisementDto } from './dtos/update-image-orders-advertisement.dto';

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

    async updloadImage(advertisementid: string, fileName: string, filePath: string, order: number): Promise<void> {
        try {
            const url = `${this.advertisementImagesUrl}/${fileName}`;
            const id = fileName.replace('-','.').split('.')[1];
            
            const updatedAdvertisement = await this.advertisementModel.findByIdAndUpdate(advertisementid,
                { $push: { photos: { id, name: fileName, url, order } }},
                { new: true }
            ).exec();

            if (!updatedAdvertisement) throw new NotFoundException('notfound.advertisement.do.not.exists');
        } catch(error) {
            fs.unlink(filePath, () => {});
            throw error;
        }
    }

    async deleteImage(advertisementid: string, imageid: string): Promise<void> {
        const advertisement = await this.advertisementModel.findById(advertisementid);
        if (!advertisement) throw new NotFoundException('notfound.advertisement.do.not.exists');

        const photos = advertisement.photos;
        if(!photos) return;
        
        const photoToRemove = photos.find((a) => a.id === imageid);
        if(!photoToRemove) return;

        const newPhotos = photos.filter((a) => a.id !== imageid);

        await this.advertisementModel.findByIdAndUpdate(
            advertisementid,
            { photos: newPhotos },
            { new: true }
        );

        fs.unlink(`./uploads/${photoToRemove.name}`, () => {});
    }
    
    async updateImageOrders(advertisementid: string, updateImagesOrdersAdvertisementDto: UpdateImagesOrdersAdvertisementDto[]): Promise<void> {
        const advertisement = await this.advertisementModel.findById(advertisementid);
        if (!advertisement) throw new NotFoundException('notfound.advertisement.do.not.exists');

        const photos = advertisement.photos;
        if(!photos) return;

        const newPhotos = updateImagesOrdersAdvertisementDto.map((a) => {
            const photo = photos.find((b) => b.id === a.id);
            if(!photo) throw new Error(`notfound.photo.id.${a.id}.do.not.exists`);
            
            photo.order = a.order;
            return photo;
        });

        await this.advertisementModel.findByIdAndUpdate(
            advertisementid,
            { photos: newPhotos },
            { new: true }
        );
    }
}
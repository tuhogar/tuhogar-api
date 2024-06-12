import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Advertisement, AdvertisementStatus } from './interfaces/advertisement.interface';
import { InjectModel } from '@nestjs/mongoose';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { UpdateImageOrderAdvertisementDto } from './dtos/update-image-order-advertisement.dto';
import { AuthenticatedUser } from 'src/users/interfaces/authenticated-user.interface';
import { CreateUpdateAdvertisementDto } from './dtos/create-update-advertisement.dto';
import { UpdateStatusAdvertisementDto } from './dtos/update-status-advertisement.dto';
import { UserRole } from 'src/users/interfaces/user.interface';

export const imageFileFilter = (req, file, callback) => {
    if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
      return callback(new Error('invalid.only.image.files.are.allowed'), false);
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
        authenticatedUser: AuthenticatedUser,
        createUpdateAdvertisementDto: CreateUpdateAdvertisementDto,
    ): Promise<void> {
        const advertisementCreated = new this.advertisementModel({ 
            accountId: authenticatedUser.accountId, 
            createdUserId: authenticatedUser.userId, 
            updatedUserId: authenticatedUser.userId, 
            status: AdvertisementStatus.WAITING_FOR_APPROVAL,
            ...createUpdateAdvertisementDto,
        });
        await advertisementCreated.save();
    }

    async update(
        authenticatedUser: AuthenticatedUser,
        advertisementid: string,
        createUpdateAdvertisementDto: CreateUpdateAdvertisementDto,
    ): Promise<void> {

        const updatedAdvertisement = await this.advertisementModel.findOneAndUpdate({ 
            accountId: authenticatedUser.accountId,
            _id: advertisementid
        },
            { 
                updatedUserId: authenticatedUser.userId,
                status: AdvertisementStatus.WAITING_FOR_APPROVAL,
                ...createUpdateAdvertisementDto
            },
            { new: true }
        ).exec();

        if (!updatedAdvertisement) throw new Error('notfound.advertisement.do.not.exists');
    }

    async getAllByAccountId(accountId: string): Promise<Advertisement[]> {
        return this.advertisementModel.find({ accountId }).exec();
    }

    async updloadImage(accountId: string, advertisementid: string, fileName: string, filePath: string, order: number): Promise<void> {
        try {
            const url = `${this.advertisementImagesUrl}/${fileName}`;
            const id = fileName.replace('-','.').split('.')[1];
            
            const updatedAdvertisement = await this.advertisementModel.findOneAndUpdate({ accountId, _id: advertisementid },
                { $push: { photos: { id, name: fileName, url, order } }},
                { new: true }
            ).exec();

            if (!updatedAdvertisement) throw new Error('notfound.advertisement.do.not.exists');
        } catch(error) {
            fs.unlink(filePath, () => {});
            throw error;
        }
    }

    async deleteImage(accountId: string, advertisementid: string, imageid: string): Promise<void> {
        const advertisement = await this.getByAccountIdAndId(accountId, advertisementid);

        const photos = advertisement.photos;
        if(!photos) return;
        
        const photoToRemove = photos.find((a) => a.id === imageid);
        if(!photoToRemove) return;

        const newPhotos = photos.filter((a) => a.id !== imageid);

        await this.advertisementModel.findOneAndUpdate(
            { accountId, _id: advertisementid },
            { photos: newPhotos },
            { new: true }
        );

        fs.unlink(`./uploads/${photoToRemove.name}`, () => {});
    }
    
    async updateImageOrders(accountId: string, advertisementid: string, updateImagesOrdersAdvertisementDto: UpdateImageOrderAdvertisementDto[]): Promise<void> {
        const advertisement = await this.getByAccountIdAndId(accountId, advertisementid);

        const photos = advertisement.photos;
        if(!photos) return;

        const newPhotos = updateImagesOrdersAdvertisementDto.map((a) => {
            const photo = photos.find((b) => b.id === a.id);
            if(!photo) throw new Error(`notfound.photo.id.${a.id}.do.not.exists`);
            
            photo.order = a.order;
            return photo;
        });

        await this.advertisementModel.findOneAndUpdate(
            { accountId, _id: advertisementid },
            { photos: newPhotos },
            { new: true }
        );
    }

    async getByAccountIdAndId(accountId: string, advertisementid: string): Promise<Advertisement> {
        const advertisement = await this.advertisementModel.findOne({ accountId, _id: advertisementid });
        if (!advertisement) throw new Error('notfound.advertisement.do.not.exists');

        return advertisement;
    }

    async getAllToApprove(): Promise<Advertisement[]> {
        return this.advertisementModel.find({ status: AdvertisementStatus.WAITING_FOR_APPROVAL }).sort({ createdAt: -1 });
    }

    async updateStatus(
        authenticatedUser: AuthenticatedUser,
        advertisementid: string,
        updateStatusAdvertisementDto: UpdateStatusAdvertisementDto,
    ): Promise<void> {
        const filter = { _id: advertisementid, accountId: authenticatedUser.accountId };
        if (authenticatedUser.userRole == UserRole.MASTER) delete filter.accountId;

        const updatedAdvertisement = await this.advertisementModel.findOneAndUpdate(
            filter,
            { 
                updatedUserId: authenticatedUser.userId,
                ...updateStatusAdvertisementDto,
            },
            { new: true }
        ).exec();

        if (!updatedAdvertisement) throw new Error('notfound.advertisement.do.not.exists');
    }
}
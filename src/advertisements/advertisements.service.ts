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
import { AdvertisementCodesService } from 'src/advertisement-codes/advertisement-codes.service';
import { AlgoliaService } from 'src/algolia/algolia.service';
import { GetActivesAdvertisementDto } from './dtos/get-actives-advertisement.dto';

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
    constructor(
        private configService: ConfigService,
        private readonly advertisementCodesService: AdvertisementCodesService,
        private readonly algoliaService: AlgoliaService,
        @InjectModel('Advertisement') private readonly advertisementModel: Model<Advertisement>,
    ) {}

    async create(
        authenticatedUser: AuthenticatedUser,
        createUpdateAdvertisementDto: CreateUpdateAdvertisementDto,
    ): Promise<void> {
        const advertisementCreated = new this.advertisementModel({ 
            accountId: authenticatedUser.accountId, 
            createdUserId: authenticatedUser.userId, 
            updatedUserId: authenticatedUser.userId, 
            status: AdvertisementStatus.WAITING_FOR_APPROVAL,
            code: await this.advertisementCodesService.generate(),
            ...createUpdateAdvertisementDto,
        });
        await advertisementCreated.save();
    }

    async update(
        authenticatedUser: AuthenticatedUser,
        advertisementId: string,
        createUpdateAdvertisementDto: CreateUpdateAdvertisementDto,
    ): Promise<void> {

        const updatedAdvertisement = await this.advertisementModel.findOneAndUpdate({ 
            accountId: authenticatedUser.accountId,
            _id: advertisementId
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

    async bulk(): Promise<void> {
        const advertisements = await this.advertisementModel.find({ status: AdvertisementStatus.ACTIVE })
        .select('code transactionType type constructionType allContentsIncluded isResidentialComplex isPenthouse bedsCount bathsCount parkingCount floorsCount constructionYear socioEconomicLevel isHoaIncluded amenities hoaFee lotArea floorArea price pricePerFloorArea pricePerLotArea address')
        .lean()
        .exec();

        await this.algoliaService.bulk(advertisements);
    }

    async getActives(getActivesAdvertisementDto: GetActivesAdvertisementDto): Promise<Advertisement[]> {
        const advertisementIds = await this.algoliaService.get(getActivesAdvertisementDto);
        if (!advertisementIds.length) throw Error('notfound.advertisements');

        return this.advertisementModel.find({ _id: { $in: advertisementIds } }).exec();
    }

    async getAllByAccountId(accountId: string): Promise<Advertisement[]> {
        return this.advertisementModel.find({ accountId }).exec();
    }

    async updloadImage(accountId: string, advertisementId: string, fileName: string, filePath: string, order: number): Promise<void> {
        try {
            const id = fileName.replace('-','.').split('.')[1];

            const updatedAdvertisement = await this.advertisementModel.findOneAndUpdate({ accountId, _id: advertisementId },
                { $push: { photos: { id, name: fileName, order } }},
                { new: true }
            ).exec();

            if (!updatedAdvertisement) throw new Error('notfound.advertisement.do.not.exists');
        } catch(error) {
            fs.unlink(filePath, () => {});
            throw error;
        }
    }

    async deleteImage(authenticatedUser: AuthenticatedUser, advertisementId: string, imageid: string): Promise<void> {
        const advertisement = await this.getByAccountIdAndId(authenticatedUser, advertisementId);

        const photos = advertisement.photos;
        if(!photos) return;
        
        const photoToRemove = photos.find((a) => a.id === imageid);
        if(!photoToRemove) return;

        const newPhotos = photos.filter((a) => a.id !== imageid);

        await this.advertisementModel.findOneAndUpdate(
            { accountId: authenticatedUser.accountId, _id: advertisementId },
            { photos: newPhotos },
            { new: true }
        ).exec();

        fs.unlink(`./uploads/${photoToRemove.name}`, () => {});
    }
    
    async updateImageOrders(authenticatedUser: AuthenticatedUser, advertisementId: string, updateImagesOrdersAdvertisementDto: UpdateImageOrderAdvertisementDto[]): Promise<void> {
        const advertisement = await this.getByAccountIdAndId(authenticatedUser, advertisementId);

        const photos = advertisement.photos;
        if(!photos) return;

        const newPhotos = updateImagesOrdersAdvertisementDto.map((a) => {
            const photo = photos.find((b) => b.id === a.id);
            if(!photo) throw new Error(`notfound.photo.id.${a.id}.do.not.exists`);
            
            photo.order = a.order;
            return photo;
        });

        await this.advertisementModel.findOneAndUpdate(
            { accountId: authenticatedUser.accountId, _id: advertisementId },
            { photos: newPhotos },
            { new: true }
        ).exec();
    }

    async getByAccountIdAndId(authenticatedUser: AuthenticatedUser, advertisementId: string): Promise<Advertisement> {
        const filter = {
            _id: advertisementId,
            ...(authenticatedUser.userRole !== UserRole.MASTER && { accountId: authenticatedUser.accountId })
        };

        const advertisement = await this.advertisementModel.findOne(filter).exec();
        if (!advertisement) throw new Error('notfound.advertisement.do.not.exists');

        return advertisement;
    }

    async getAllToApprove(): Promise<Advertisement[]> {
        return this.advertisementModel.find({ status: AdvertisementStatus.WAITING_FOR_APPROVAL }).sort({ createdAt: -1 }).exec();
    }

    async updateStatus(
        authenticatedUser: AuthenticatedUser,
        advertisementId: string,
        updateStatusAdvertisementDto: UpdateStatusAdvertisementDto,
    ): Promise<void> {
        const filter = {
            _id: advertisementId,
            ...(authenticatedUser.userRole !== UserRole.MASTER && { accountId: authenticatedUser.accountId })
        };

        let publishedAt = undefined;
        let approvingUserId = undefined;
        if (updateStatusAdvertisementDto.status === AdvertisementStatus.ACTIVE) {
            publishedAt = new Date();
            approvingUserId = authenticatedUser.userId;
        }

        const updatedAdvertisement = await this.advertisementModel.findOneAndUpdate(
            filter,
            { 
                updatedUserId: authenticatedUser.userId,
                ...updateStatusAdvertisementDto,
                publishedAt,
                approvingUserId,
            },
            { new: true }
        ).exec();

        if (!updatedAdvertisement) throw new Error('notfound.advertisement.do.not.exists');
    }
}
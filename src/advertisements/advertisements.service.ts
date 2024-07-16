import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Advertisement, AdvertisementPhoto, AdvertisementStatus } from './interfaces/advertisement.interface';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import * as fs from 'fs';
import * as sharp from 'sharp';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { AuthenticatedUser } from 'src/users/interfaces/authenticated-user.interface';
import { CreateUpdateAdvertisementDto } from './dtos/create-update-advertisement.dto';
import { UpdateStatusAdvertisementDto } from './dtos/update-status-advertisement.dto';
import { UserRole } from 'src/users/interfaces/user.interface';
import { AdvertisementCodesService } from 'src/advertisement-codes/advertisement-codes.service';
import { AlgoliaService } from 'src/algolia/algolia.service';
import { GetActivesAdvertisementDto } from './dtos/get-actives-advertisement.dto';
import { BulkUpdateDateService } from 'src/bulk-update-date/bulk-update-date.service';
import { UploadImagesAdvertisementDto } from './dtos/upload-images-advertisement.dto';
import { UpdateStatusAllAdvertisementsDto } from './dtos/update-status-all-advertisement.dto';
import { DeleteImagesAdvertisementDto } from './dtos/delete-images-advertisement.dto';
import { DeleteAdvertisementsDto } from './dtos/delete-advertisements.dto';
import { plainToClass } from 'class-transformer';
import { AddressDto } from 'src/addresses/dtos/address.dto';

@Injectable()
export class AdvertisementsService {
    private imagesUrl: string;
    private readonly uploadDir = path.join(__dirname, '..', '..', 'uploads');

    constructor(
        private configService: ConfigService,
        private readonly advertisementCodesService: AdvertisementCodesService,
        private readonly algoliaService: AlgoliaService,
        private readonly bulkUpdateDateService: BulkUpdateDateService,
        @InjectModel('Advertisement') private readonly advertisementModel: Model<Advertisement>,
    ) {
        this.imagesUrl = this.configService.get<string>('IMAGES_URL');

        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    async create(
        authenticatedUser: AuthenticatedUser,
        createUpdateAdvertisementDto: CreateUpdateAdvertisementDto,
    ): Promise<{ id: string }> {
        createUpdateAdvertisementDto.address = plainToClass(AddressDto, createUpdateAdvertisementDto.address);
        
        const advertisementCreated = new this.advertisementModel({ 
            accountId: authenticatedUser.accountId, 
            createdUserId: authenticatedUser.userId, 
            updatedUserId: authenticatedUser.userId, 
            status: AdvertisementStatus.WAITING_FOR_APPROVAL,
            code: await this.advertisementCodesService.generate(),
            ...createUpdateAdvertisementDto,
        });
        await advertisementCreated.save();

        return { id: advertisementCreated._id.toString() };
    }

    async update(
        authenticatedUser: AuthenticatedUser,
        advertisementId: string,
        createUpdateAdvertisementDto: CreateUpdateAdvertisementDto,
    ): Promise<{ id: string }> {

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

        return { id: updatedAdvertisement._id.toString() };
    }

    @Cron('*/1 * * * *')
    async bulk(): Promise<void> {
        let lastUpdatedAt = (await this.bulkUpdateDateService.get())?.updatedAt || new Date(0);
        
        const advertisements = await this.advertisementModel.find({
            status: AdvertisementStatus.ACTIVE,
            updatedAt: { $gt: lastUpdatedAt },
         })
        .select('code transactionType type constructionType allContentsIncluded isResidentialComplex isPenthouse bedsCount bathsCount parkingCount floorsCount constructionYear socioEconomicLevel isHoaIncluded amenities hoaFee lotArea floorArea price pricePerFloorArea pricePerLotArea propertyTax address updatedAt')
        .lean()
        .exec();

        if (advertisements.length > 0) {
            await this.algoliaService.bulk(advertisements);
            
            const latestUpdatedAt = new Date(Math.max(...advertisements.map(a => new Date((a.updatedAt as unknown as string)).getTime())));
            lastUpdatedAt = latestUpdatedAt;

            await this.bulkUpdateDateService.update(latestUpdatedAt);
        }
    }

    private updatePhotoUrls(advertisements: Advertisement[]): Advertisement[] {
        return advertisements.map(a => ({
            ...a.toObject(),
            photos: a.photos.map(photo => ({
                ...photo,
                url: `${this.imagesUrl}/${photo.name}`,
                thumbnailUrl: `${this.imagesUrl}/${photo.thumbnailName}`,
            })),
        })) as Advertisement[];
    }

    async getActives(getActivesAdvertisementDto: GetActivesAdvertisementDto): Promise<Advertisement[]> {
        const advertisementIds = await this.algoliaService.get(getActivesAdvertisementDto);
        if (!advertisementIds.length) throw Error('notfound.advertisements');

        const advertisements = await this.advertisementModel.find({ _id: { $in: advertisementIds } }).populate('amenities').exec();
        
        return this.updatePhotoUrls(advertisements);
    }

    async getAllByAccountId(accountId: string): Promise<Advertisement[]> {
        const advertisements = await this.advertisementModel.find({ accountId }).populate('amenities').exec();

        return this.updatePhotoUrls(advertisements);
    }

    async get(advertisementId: string): Promise<Advertisement> {
        const advertisement = await this.advertisementModel.findById(advertisementId).populate('amenities').exec();
        if (!advertisement) throw new Error('notfound.advertisement.do.not.exists');

        const [updatedAdvertisement] = this.updatePhotoUrls([advertisement]);
        return updatedAdvertisement;
    }

    async getAllToApprove(): Promise<Advertisement[]> {
        return this.advertisementModel.find({ status: AdvertisementStatus.WAITING_FOR_APPROVAL }).populate('amenities').sort({ createdAt: -1 }).exec();
    }

    async updateStatus(
        authenticatedUser: AuthenticatedUser,
        advertisementId: string,
        updateStatusAdvertisementDto: UpdateStatusAdvertisementDto,
    ): Promise<{ id: string }> {
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

        if (updateStatusAdvertisementDto.status !== AdvertisementStatus.ACTIVE) {
            await this.algoliaService.delete(advertisementId);
        }

        return { id: updatedAdvertisement._id.toString() };
    }

    async updateStatusAll(
        userId: string,
        updateStatusAllAdvertisementsDto: UpdateStatusAllAdvertisementsDto,
    ): Promise<void> {
        const advertisementIds = updateStatusAllAdvertisementsDto.advertisements.map((a) => a.id);

        let publishedAt = undefined;
        let approvingUserId = undefined;
        if (updateStatusAllAdvertisementsDto.status === AdvertisementStatus.ACTIVE) {
            publishedAt = new Date();
            approvingUserId = userId;
        }

        const update = {
            updatedUserId: userId,
            status: updateStatusAllAdvertisementsDto.status,
            publishedAt,
            approvingUserId,
          };

        const updatedAdvertisement = await this.advertisementModel.updateMany(
            { _id: { $in: advertisementIds } },
            update,
            { new: true }
        ).exec();

        if (updatedAdvertisement.upsertedCount === 0 && updatedAdvertisement.modifiedCount === 0 && updatedAdvertisement.matchedCount === 0) throw new Error('notfound.advertisement.do.not.exists');

        if (updateStatusAllAdvertisementsDto.status !== AdvertisementStatus.ACTIVE) {
            updateStatusAllAdvertisementsDto.advertisements.forEach(async (a) => await this.algoliaService.delete(a.id));
        }
    }

    async processImages(accountId: string, advertisementId: string, uploadImagesAdvertisementDto: UploadImagesAdvertisementDto): Promise<void> {
        const advertisement = await this.advertisementModel.findById(advertisementId);
        if (!advertisement) throw new Error('notfound.advertisement.do.not.exists');
        const photos = advertisement.photos;
        const newPhotos: AdvertisementPhoto[] = [];
    
        for (const image of uploadImagesAdvertisementDto.images) {
            if (!image.id) {
                const fileName = image.name.split('.');
                const extention = fileName[fileName.length-1];

                const randomId = uuidv4();
                const imageName = `${advertisementId}-${randomId}.${extention}`;
                const imageThumbnailName = `${advertisementId}-${randomId}-thumbnail.${extention}`;

                const originalFilePath = path.join(this.uploadDir, imageName);
                const thumbnailFilePath = path.join(this.uploadDir, imageThumbnailName);

                // Salvar imagem original
                await fs.promises.writeFile(originalFilePath, Buffer.from(image.content));
            
                // Criar thumbnail
                await sharp(Buffer.from(image.content))
                    .resize(352, 352)
                    .toFile(thumbnailFilePath);
            
                    newPhotos.push({
                    id: randomId,
                    name: imageName,
                    thumbnailName: imageThumbnailName,
                    order: image.order,
                });
            } else {
                const photo = photos.find((a) => a.id === image.id);
                if (!photo)throw new Error(`notfound.advertisement.photo.id.${image.id}.do.not.exists`);
                photo.order = image.order;

                newPhotos.push(photo);
            }
        }

        const updatedAdvertisement = await this.advertisementModel.findOneAndUpdate(
            { accountId, _id: advertisementId },
            { photos: newPhotos },
            { new: true }
        ).exec();

        if (!updatedAdvertisement) throw new Error('notfound.advertisement.do.not.exists');
    }

    async deleteImages(authenticatedUser: AuthenticatedUser, advertisementId: string, deleteImagesAdvertisementDto: DeleteImagesAdvertisementDto): Promise<void> {
        const advertisement = await this.get(advertisementId);

        const photos = advertisement.photos;
        if(!photos) return;

        const imageIds = deleteImagesAdvertisementDto.images.map((a) => a.id);
        
        const photosToRemove = photos.filter((a) => imageIds.includes(a.id));
        if(!photosToRemove) return;

        const newPhotos = photos.filter((a) => !imageIds.includes(a.id));

        await this.advertisementModel.findOneAndUpdate(
            { accountId: authenticatedUser.accountId, _id: advertisementId },
            { photos: newPhotos },
            { new: true }
        ).exec();

        photosToRemove.forEach((a) => {
            fs.unlink(`./uploads/${a.name}`, () => {});
            fs.unlink(`./uploads/${a.thumbnailName}`, () => {});
        });
    }

    async deleteAll(deleteAdvertisementsDto: DeleteAdvertisementsDto): Promise<void> {
        const advertisementIds = deleteAdvertisementsDto.advertisements.map((a) => a.id);
        const advertisements = await this.advertisementModel.find({ _id: { $in: advertisementIds } }).exec();

        await this.advertisementModel.deleteMany({ _id: { $in: advertisementIds } }).exec();

        const photoNames: string[] = [];
        advertisements.forEach((a) => {
            a.photos.forEach((b) => {
                photoNames.push(b.name);
                photoNames.push(b.thumbnailName);
            })
        })

        if(!photoNames.length) return;
        
        photoNames.forEach((a) => {
            fs.unlink(`./uploads/${a}`, () => {});
        });
    }

    async getAdvertisementRegistrations(period: 'week' | 'month'): Promise<any[]> {
        let groupId: any;
        if (period === 'week') {
          groupId = {
            year: { $year: '$createdAt' },
            week: { $week: '$createdAt' },
          };
        } else {
          groupId = {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          };
        }
    
        const advertisements = await this.advertisementModel.aggregate([
          {
            $group: {
              _id: groupId,
              count: { $sum: 1 }
            }
          },
          {
            $sort: {
              '_id.year': 1,
              ...(period === 'week' ? { '_id.week': 1 } : { '_id.month': 1 })
            }
          }
        ]);
    
        return advertisements;
      }
}
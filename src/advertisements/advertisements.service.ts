import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Advertisement, AdvertisementPhoto, AdvertisementStatus } from './interfaces/advertisement.interface';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as sharp from 'sharp';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UpdateImageOrderAdvertisementDto } from './dtos/update-image-order-advertisement.dto';
import { AuthenticatedUser } from 'src/users/interfaces/authenticated-user.interface';
import { CreateUpdateAdvertisementDto } from './dtos/create-update-advertisement.dto';
import { UpdateStatusAdvertisementDto } from './dtos/update-status-advertisement.dto';
import { UserRole } from 'src/users/interfaces/user.interface';
import { AdvertisementCodesService } from 'src/advertisement-codes/advertisement-codes.service';
import { AlgoliaService } from 'src/algolia/algolia.service';
import { GetActivesAdvertisementDto } from './dtos/get-actives-advertisement.dto';
import { BulkUpdateDateService } from 'src/bulk-update-date/bulk-update-date.service';
import { UploadImagesAdvertisementDto } from './dtos/upload-images-advertisement.dto';

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
        let lastUpdatedAt = (await this.bulkUpdateDateService.get())?.updatedAt || new Date(0);
        
        const advertisements = await this.advertisementModel.find({
            status: AdvertisementStatus.ACTIVE,
            updatedAt: { $gt: lastUpdatedAt },
         })
        .select('code transactionType type constructionType allContentsIncluded isResidentialComplex isPenthouse bedsCount bathsCount parkingCount floorsCount constructionYear socioEconomicLevel isHoaIncluded amenities hoaFee lotArea floorArea price pricePerFloorArea pricePerLotArea address updatedAt')
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

        const advertisements = await this.advertisementModel.find({ _id: { $in: advertisementIds } }).exec();
        
        return this.updatePhotoUrls(advertisements);
    }

    async getAllByAccountId(accountId: string): Promise<Advertisement[]> {
        const advertisements = await this.advertisementModel.find({ accountId }).exec();

        return this.updatePhotoUrls(advertisements);
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

        const [updatedAdvertisement] = this.updatePhotoUrls([advertisement]);
        return updatedAdvertisement;
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

        if (updateStatusAdvertisementDto.status !== AdvertisementStatus.ACTIVE) {
            await this.algoliaService.delete(advertisementId);
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
}
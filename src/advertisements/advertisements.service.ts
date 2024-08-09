import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Advertisement, AdvertisementActivesOrderBy, AdvertisementPhoto, AdvertisementStatus } from './interfaces/advertisement.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Cron } from '@nestjs/schedule';
import { v4 as uuidv4 } from 'uuid';
import * as sharp from 'sharp';
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
import { OpenAiService } from 'src/open-ai/open-ai.service';
import { ImageUploadService } from 'src/image-upload/image-upload.service';

@Injectable()
export class AdvertisementsService {
    constructor(
        private readonly advertisementCodesService: AdvertisementCodesService,
        private readonly algoliaService: AlgoliaService,
        private readonly bulkUpdateDateService: BulkUpdateDateService,
        private readonly openAiService: OpenAiService,
        private readonly imageUploadService: ImageUploadService,
        @InjectModel('Advertisement') private readonly advertisementModel: Model<Advertisement>,
    ) {}

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

        let removeOnAlgolia = false;

        const advertisement = await this.advertisementModel.findOne({ _id: advertisementId, accountId: authenticatedUser.accountId });
        if (!advertisement) throw new Error('notfound.advertisement.do.not.exists');

        const update: any = { 
            updatedUserId: authenticatedUser.userId,
            ...createUpdateAdvertisementDto
        }

        if (createUpdateAdvertisementDto.description !== advertisement.description) {
            update.status = AdvertisementStatus.WAITING_FOR_APPROVAL;
            removeOnAlgolia = true;
        }

        const updatedAdvertisement = await this.advertisementModel.findOneAndUpdate({ 
            accountId: authenticatedUser.accountId,
            _id: advertisementId
        },
        update,
        { new: true }
        ).exec();

        if (removeOnAlgolia) await this.algoliaService.delete(updatedAdvertisement._id.toString());

        return { id: updatedAdvertisement._id.toString() };
    }

    @Cron('*/1 * * * *')
    async bulk(): Promise<void> {
        let lastUpdatedAt = (await this.bulkUpdateDateService.get())?.updatedAt || new Date(0);
        
        const advertisements = await this.advertisementModel.find({
            status: AdvertisementStatus.ACTIVE,
            updatedAt: { $gt: lastUpdatedAt },
         })
        .select('code accountId transactionType type constructionType allContentsIncluded isResidentialComplex isPenthouse bedsCount bathsCount parkingCount floorsCount constructionYear socioEconomicLevel isHoaIncluded amenities hoaFee lotArea floorArea price pricePerFloorArea pricePerLotArea propertyTax address updatedAt')
        .lean()
        .exec();

        if (advertisements.length > 0) {
            await this.algoliaService.bulk(advertisements);
            
            const latestUpdatedAt = new Date(Math.max(...advertisements.map(a => new Date((a.updatedAt as unknown as string)).getTime())));
            lastUpdatedAt = latestUpdatedAt;

            await this.bulkUpdateDateService.update(latestUpdatedAt);
        }
    }

    async getActives(getActivesAdvertisementDto: GetActivesAdvertisementDto): Promise<{ data: Advertisement[], count: number }> {
        const { data: advertisementIds, count } = await this.algoliaService.get(getActivesAdvertisementDto);
        if (!advertisementIds.length) throw Error('notfound.advertisements');

        let orderBy = undefined;
        switch (getActivesAdvertisementDto.orderBy) {
            case AdvertisementActivesOrderBy.HIGHEST_PRICE:
                orderBy = { price: -1 };
                break;
            case AdvertisementActivesOrderBy.LOWEST_PRICE:
                orderBy = { price: 1 };
                break;
            case AdvertisementActivesOrderBy.HIGHEST_PRICE_M2:
                orderBy = { pricePerFloorArea: -1 };
                break;
            case AdvertisementActivesOrderBy.LOWEST_PRICE_M2:
                orderBy = { pricePerFloorArea: 1 };
                break;
            default:
                break;
        }

        const advertisements = await this.advertisementModel.find({ _id: { $in: advertisementIds } }).populate('amenities').sort(orderBy).exec();

        advertisements.sort(() => Math.random() - 0.5);

        return { data: advertisements, count };
    }

    async getAllByAccountId(accountId: string): Promise<Advertisement[]> {
        return this.advertisementModel.find({ accountId }).sort({ createdAt: -1 }).populate('amenities').exec();
    }

    async getByAccountIdAndId(authenticatedUser: AuthenticatedUser,advertisementId: string): Promise<Advertisement> {
        const filter = {
            _id: advertisementId,
            ...(authenticatedUser.userRole !== UserRole.MASTER && { accountId: authenticatedUser.accountId })
        };

        const advertisement = await this.advertisementModel.findOne(filter).populate('amenities').exec();
        if (!advertisement) throw new Error('notfound.advertisement.do.not.exists');

        return advertisement;
    }

    async get(advertisementId: string): Promise<Advertisement> {
        const advertisement = await this.advertisementModel.findById(advertisementId).populate('amenities').exec();
        if (!advertisement) throw new Error('notfound.advertisement.do.not.exists');

        return advertisement;
    }

    async getAllToApprove(): Promise<Advertisement[]> {
        return this.advertisementModel.find({ status: AdvertisementStatus.WAITING_FOR_APPROVAL }).populate('amenities').sort({ updatedAt: -1 }).exec();
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
        authenticatedUser: AuthenticatedUser,
        updateStatusAllAdvertisementsDto: UpdateStatusAllAdvertisementsDto,
    ): Promise<void> {
        const advertisementIds = updateStatusAllAdvertisementsDto.advertisements.map((a) => a.id);

        const filter = {
            _id: { $in: advertisementIds },
            ...(authenticatedUser.userRole !== UserRole.MASTER && { accountId: authenticatedUser.accountId })
        };

        let publishedAt = undefined;
        let approvingUserId = undefined;
        if (updateStatusAllAdvertisementsDto.status === AdvertisementStatus.ACTIVE) {
            publishedAt = new Date();
            approvingUserId = authenticatedUser.userId;
        }

        const update = {
            updatedUserId: authenticatedUser.userId,
            status: updateStatusAllAdvertisementsDto.status,
            publishedAt,
            approvingUserId,
          };

        const updatedAdvertisement = await this.advertisementModel.updateMany(
            filter,
            update,
            { new: true }
        ).exec();

        if (updatedAdvertisement.upsertedCount === 0 && updatedAdvertisement.modifiedCount === 0 && updatedAdvertisement.matchedCount === 0) throw new Error('notfound.advertisement.do.not.exists');

        if (updateStatusAllAdvertisementsDto.status !== AdvertisementStatus.ACTIVE) {
            updateStatusAllAdvertisementsDto.advertisements.forEach(async (a) => await this.algoliaService.delete(a.id));
        }
    }

    private async resizeImage(base64Image: string, maxWidth: number, maxHeight: number): Promise<string> {
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
        const imgBuffer = Buffer.from(base64Data, 'base64');
    
        // Obtém as dimensões da imagem
        const metadata = await sharp(imgBuffer).metadata();
        const { width, height } = metadata;
    
        // Redimensiona a imagem somente se ela for maior que 1920x1080
        if (width > maxWidth || height > maxHeight) {
            const resizedBuffer = await sharp(imgBuffer)
                .resize({ width: maxWidth, height: maxHeight, fit: 'inside' })
                .toBuffer();
            return resizedBuffer.toString('base64');
        }
    
        // Retorna a imagem original se for menor ou igual ao tamanho máximo
        return base64Image;
    }

    private async convertToWebP(base64Image: string): Promise<string> {
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
        const imgBuffer = Buffer.from(base64Data, 'base64');
    
        const webpBuffer = await sharp(imgBuffer)
            .webp({ quality: 80 })
            .toBuffer();
    
        return webpBuffer.toString('base64');
    }

    async processImages(accountId: string, advertisementId: string, uploadImagesAdvertisementDto: UploadImagesAdvertisementDto): Promise<void> {
        const advertisement = await this.advertisementModel.findById(advertisementId);
        if (!advertisement) throw new Error('notfound.advertisement.do.not.exists');
        const photos = advertisement.photos;
        const newPhotos: AdvertisementPhoto[] = [];
    
        for (const image of uploadImagesAdvertisementDto.images) {
            if (!image.id) {
                const randomId = uuidv4();
                const imageName = `${advertisementId}-${randomId}`;
                //const imageThumbnailName = `${advertisementId}-${randomId}-thumbnail`;

                // Decodificar base64
                //const imageData = Buffer.from(image.content, 'base64');

                // Criar thumbnail
                //const thumbnailBuffer = await sharp(imageData)
                //    .resize(352, 352)
                //    .toBuffer();

                const resizedImageContent = await this.resizeImage(image.content, 1920, 1080);


                let imageContent = resizedImageContent;
                if (!image.contentType.includes('webp')) {
                    imageContent = await this.convertToWebP(imageContent);
                }
            
                const imageUrl = await this.imageUploadService.uploadBase64Image(imageContent, 'image/webp', imageName, 'advertisements');
                const imageUrlStr = imageUrl.toString().replace('http://', 'https://')
                //await this.imageUploadService.uploadImageBuffer(thumbnailBuffer, image.contentType, imageThumbnailName);
                const imageThumbnailUrl = imageUrlStr.replace('upload/', 'upload/c_thumb,w_352,h_352,g_face/');

                newPhotos.push({
                    id: randomId,
                    name: imageUrlStr.split('/')[imageUrlStr.split('/').length-1],
                    url: imageUrlStr,
                    thumbnailUrl: imageThumbnailUrl,
                    order: image.order,
                });
            } else {
                const photo = photos.find((a) => a.id === image.id);
                if (!photo) throw new Error(`notfound.advertisement.photo.id.${image.id}.do.not.exists`);
                photo.order = image.order;

                newPhotos.push(photo);
            }
        }

        photos.forEach(async (a) => {
            const photo = uploadImagesAdvertisementDto.images.find((b) => b.id === a.id);
            if (!photo) await this.imageUploadService.deleteImage(this.getPublicIdFromImageUrl(a.url));

        });

        const updatedAdvertisement = await this.advertisementModel.findOneAndUpdate(
            { accountId, _id: advertisementId },
            { 
                photos: newPhotos,
                status: AdvertisementStatus.WAITING_FOR_APPROVAL,
             },
            { new: true }
        ).exec();

        if (!updatedAdvertisement) throw new Error('notfound.advertisement.do.not.exists');

        await this.algoliaService.delete(updatedAdvertisement._id.toString());
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

        photosToRemove.forEach(async (a) => {
            await this.imageUploadService.deleteImage(this.getPublicIdFromImageUrl(a.url));
        });
    }

    async deleteAll(authenticatedUser: AuthenticatedUser, deleteAdvertisementsDto: DeleteAdvertisementsDto): Promise<void> {
        const advertisementIds = deleteAdvertisementsDto.advertisements.map((a) => a.id);

        const filter = {
            _id: { $in: advertisementIds },
            ...(authenticatedUser.userRole !== UserRole.MASTER && { accountId: authenticatedUser.accountId })
        };

        const advertisements = await this.advertisementModel.find(filter).exec();

        await this.advertisementModel.deleteMany(filter).exec();

        advertisements.forEach(async (a) => await this.algoliaService.delete(a._id.toString()));

        const photoUrls: string[] = [];
        advertisements.forEach((a) => {
            a.photos.forEach((b) => {
                photoUrls.push(b.url);
            })
        })

        if(!photoUrls.length) return;
        
        photoUrls.forEach(async (a) => {
            await this.imageUploadService.deleteImage(this.getPublicIdFromImageUrl(a));
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

    async findSimilarDocuments(query: string) {
        const embedding = await this.openAiService.getEmbedding(query);
    
        return this.advertisementModel.aggregate([
            {
                "$vectorSearch": {
                "queryVector": embedding,
                "path": "plot_embedding",
                "numCandidates": 100,
                "limit": 5,
                "index": "advertisements_vector_index",
                }
            }
            ]).exec();
    }

    private getPublicIdFromImageUrl(imageUrl: string): string {
        const split = imageUrl.split('/');
        return `${split[split.length-2]}/${split[split.length-1].split('.')[0]  }`;
    }
}
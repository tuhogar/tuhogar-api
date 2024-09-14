import { Injectable } from '@nestjs/common';
import { Advertisement, AdvertisementActivesOrderBy, AdvertisementPhoto, AdvertisementStatus } from 'src/domain/entities/advertisement.interface';
import { Cron } from '@nestjs/schedule';
import { v4 as uuidv4 } from 'uuid';
import * as sharp from 'sharp';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user.interface';
import { CreateUpdateAdvertisementDto } from 'src/infraestructure/http/dtos/advertisement/create-update-advertisement.dto';
import { UpdateStatusAdvertisementDto } from 'src/infraestructure/http/dtos/advertisement/update-status-advertisement.dto';
import { UserRole } from 'src/domain/entities/user.interface';
import { AdvertisementCodeService } from 'src/application/use-cases/advertisement-code/advertisement-code.service';
import { AlgoliaService } from 'src/infraestructure/algolia/algolia.service';
import { GetActivesAdvertisementDto } from 'src/infraestructure/http/dtos/advertisement/get-actives-advertisement.dto';
import { BulkUpdateDateService } from 'src/application/use-cases/bulk-update-date/bulk-update-date.service';
import { UploadImagesAdvertisementDto } from 'src/infraestructure/http/dtos/advertisement/upload-images-advertisement.dto';
import { UpdateStatusAllAdvertisementsDto } from 'src/infraestructure/http/dtos/advertisement/update-status-all-advertisement.dto';
import { DeleteImagesAdvertisementDto } from 'src/infraestructure/http/dtos/advertisement/delete-images-advertisement.dto';
import { DeleteAdvertisementsDto } from 'src/infraestructure/http/dtos/advertisement/delete-advertisements.dto';
import { plainToClass } from 'class-transformer';
import { AddressDto } from 'src/infraestructure/http/dtos/address/address.dto';
import { OpenAiService } from 'src/infraestructure/open-ai/open-ai.service';
import { CloudinaryService } from 'src/infraestructure/cloudinary/cloudinary.service';
import { IAdvertisementRepository } from 'src/application/interfaces/repositories/advertisement.repository.interface';

@Injectable()
export class AdvertisementService {
    constructor(
        private readonly advertisementCodeService: AdvertisementCodeService,
        private readonly algoliaService: AlgoliaService,
        private readonly bulkUpdateDateService: BulkUpdateDateService,
        private readonly openAiService: OpenAiService,
        private readonly imageUploadService: CloudinaryService,
        private readonly advertisementRepository: IAdvertisementRepository,
    ) {}

    async create(
        authenticatedUser: AuthenticatedUser,
        createUpdateAdvertisementDto: CreateUpdateAdvertisementDto,
    ): Promise<{ id: string }> {
        createUpdateAdvertisementDto.address = plainToClass(AddressDto, createUpdateAdvertisementDto.address);
        
        const advertisementCreated = await this.advertisementRepository.create({
            accountId: authenticatedUser.accountId, 
            createdUserId: authenticatedUser.userId, 
            updatedUserId: authenticatedUser.userId, 
            status: AdvertisementStatus.WAITING_FOR_APPROVAL,
            code: await this.advertisementCodeService.generate(),
            ...createUpdateAdvertisementDto,
        });

        return { id: advertisementCreated.id };
    }

    async update(
        authenticatedUser: AuthenticatedUser,
        advertisementId: string,
        createUpdateAdvertisementDto: CreateUpdateAdvertisementDto,
    ): Promise<{ id: string }> {

        let removeOnAlgolia = false;

        const advertisement = await this.advertisementRepository.findOne(advertisementId, authenticatedUser.accountId);
        if (!advertisement) throw new Error('notfound.advertisement.do.not.exists');

        const update: any = { 
            updatedUserId: authenticatedUser.userId,
            ...createUpdateAdvertisementDto
        }

        if (createUpdateAdvertisementDto.description !== advertisement.description) {
            update.status = AdvertisementStatus.WAITING_FOR_APPROVAL;
            removeOnAlgolia = true;
        }

        const updatedAdvertisement = await this.advertisementRepository.findOneAndUpdate(advertisementId, authenticatedUser.accountId, update);

        if (removeOnAlgolia) await this.algoliaService.delete(updatedAdvertisement._id.toString());

        return { id: updatedAdvertisement._id.toString() };
    }

    @Cron('*/1 * * * *')
    async bulk(): Promise<void> {
        let lastUpdatedAt = (await this.bulkUpdateDateService.get())?.updatedAt || new Date(0);
        
        const advertisements = await this.advertisementRepository.findForBulk(lastUpdatedAt);

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

        const advertisements = await this.advertisementRepository.findForActives(advertisementIds, orderBy);

        advertisements.sort(() => Math.random() - 0.5);

        return { data: advertisements, count };
    }

    async getAllByAccountId(accountId: string): Promise<Advertisement[]> {
        return this.advertisementRepository.getAllByAccountId(accountId);
    }

    async getByAccountIdAndId(authenticatedUser: AuthenticatedUser,advertisementId: string): Promise<Advertisement> {
        const filter = {
            _id: advertisementId,
            ...(authenticatedUser.userRole !== UserRole.MASTER && { accountId: authenticatedUser.accountId })
        };

        const advertisement = await this.advertisementRepository.getByAccountIdAndId(filter);
        if (!advertisement) throw new Error('notfound.advertisement.do.not.exists');

        return advertisement;
    }

    async get(advertisementId: string): Promise<Advertisement> {
        const advertisement = await this.advertisementRepository.get(advertisementId);
        if (!advertisement) throw new Error('notfound.advertisement.do.not.exists');

        return advertisement;
    }

    async getActive(advertisementId: string): Promise<Advertisement> {
        const advertisement = await this.advertisementRepository.getActive(advertisementId);
        if (!advertisement) throw new Error('notfound.advertisement.do.not.exists');

        return advertisement;
    }

    async getAllToApprove(): Promise<Advertisement[]> {
        return this.advertisementRepository.getAllToApprove();
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

        const updatedAdvertisement = await this.advertisementRepository.findForUpdateStatus(authenticatedUser.userId, filter, updateStatusAdvertisementDto, publishedAt, approvingUserId);

        if (!updatedAdvertisement) throw new Error('notfound.advertisement.do.not.exists');

        if (updateStatusAdvertisementDto.status !== AdvertisementStatus.ACTIVE) {
            await this.algoliaService.delete(advertisementId);
        }

        return { id: updatedAdvertisement.id };
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

        const updatedAdvertisement = await this.advertisementRepository.updateStatusAll(filter, update);

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
        const advertisement = await this.advertisementRepository.findById(advertisementId);
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

        const updatedAdvertisement = await this.advertisementRepository.updateProcessPhotos(accountId, advertisementId, newPhotos);

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

        await this.advertisementRepository.updateForDeletePhotos(authenticatedUser.accountId, advertisementId, newPhotos);

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

        const advertisements = await this.advertisementRepository.find(filter);

        await this.advertisementRepository.deleteMany(filter);

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
        return this.advertisementRepository.getAdvertisementRegistrations(period);
    }

    async findSimilarDocuments(query: string) {
        const embedding = await this.openAiService.getEmbedding(query);
    
        return this.advertisementRepository.findSimilarDocuments(embedding);
    }

    private getPublicIdFromImageUrl(imageUrl: string): string {
        const split = imageUrl.split('/');
        return `${split[split.length-2]}/${split[split.length-1].split('.')[0]  }`;
    }
}
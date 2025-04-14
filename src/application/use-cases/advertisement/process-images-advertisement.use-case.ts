import { Injectable } from '@nestjs/common';
import { AdvertisementPhoto, AdvertisementStatus } from 'src/domain/entities/advertisement';
import { v4 as uuidv4 } from 'uuid';
import { AlgoliaService } from 'src/infraestructure/algolia/algolia.service';
import { UploadImagesAdvertisementDto } from 'src/infraestructure/http/dtos/advertisement/upload-images-advertisement.dto';
import { CloudinaryService } from 'src/infraestructure/cloudinary/cloudinary.service';
import { IAdvertisementRepository } from 'src/application/interfaces/repositories/advertisement.repository.interface';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../../infraestructure/persistence/redis/redis.service';
import { AuthenticatedUser } from 'src/domain/entities/authenticated-user';
import { UserRole } from 'src/domain/entities/user';

@Injectable()
export class ProcessImagesAdvertisementUseCase {
    private readonly cloudinaryFolders: string;
    constructor(
        private readonly algoliaService: AlgoliaService,
        private readonly cloudinaryService: CloudinaryService,
        private readonly advertisementRepository: IAdvertisementRepository,
        private readonly configService: ConfigService,
        private readonly redisService: RedisService
    ) {
        this.cloudinaryFolders = this.configService.get<string>('ENVIRONMENT') === 'PRODUCTION' ? '_prod' : '';
    }

    async execute(authenticatedUser: AuthenticatedUser, advertisementId: string, uploadImagesAdvertisementDto: UploadImagesAdvertisementDto): Promise<{ id: string, order: number }[]> {
        const advertisement = await this.advertisementRepository.findOneById(advertisementId);
        if (!advertisement) throw new Error('notfound.advertisement.do.not.exists');

        if (authenticatedUser.accountId !== advertisement.accountId && authenticatedUser.userRole !== UserRole.MASTER) {
            throw new Error('notfound.advertisement.do.not.exists');
        }

        const newPhotos: AdvertisementPhoto[] = [];
    
        for (const image of uploadImagesAdvertisementDto.images) {
            const randomId = uuidv4();
            const imageName = `${advertisementId}-${randomId}`;
            //const imageThumbnailName = `${advertisementId}-${randomId}-thumbnail`;

            // Decodificar base64
            //const imageData = Buffer.from(image.content, 'base64');

            // Criar thumbnail
            //const thumbnailBuffer = await sharp(imageData)
            //    .resize(352, 352)
            //    .toBuffer();

            const resizedImageContent = await this.cloudinaryService.resizeImage(image.content, 1920, 1080);


            let imageContent = resizedImageContent;
            if (!image.contentType.includes('webp')) {
                imageContent = await this.cloudinaryService.convertToWebP(imageContent);
            }
        
            const imageUrl = await this.cloudinaryService.uploadBase64Image(imageContent, 'image/webp', imageName, `advertisements${this.cloudinaryFolders}`);
            const imageUrlStr = imageUrl.toString().replace('http://', 'https://')
            //await this.cloudinaryService.uploadImageBuffer(thumbnailBuffer, image.contentType, imageThumbnailName);
            const imageThumbnailUrl = imageUrlStr.replace('upload/', 'upload/c_thumb,w_352,h_352,c_fill,ar_1.0/');

            newPhotos.push({
                id: randomId,
                name: imageUrlStr.split('/')[imageUrlStr.split('/').length-1],
                url: imageUrlStr,
                thumbnailUrl: imageThumbnailUrl,
                order: image.order,
            });
        }

        const updatedAdvertisement = await this.advertisementRepository.createPhotos(authenticatedUser.userRole !== UserRole.MASTER ? authenticatedUser.accountId : advertisement.accountId, advertisementId, newPhotos);

        if (!updatedAdvertisement) throw new Error('notfound.advertisement.do.not.exists');

        await this.algoliaService.delete(updatedAdvertisement.id);
        await this.redisService.delete(updatedAdvertisement.id);

        return newPhotos.map((a) => ({ id: a.id, order: a.order }))
    }

    private getPublicIdFromImageUrl(imageUrl: string): string {
        const split = imageUrl.split('/');
        return `${split[split.length-2]}/${split[split.length-1].split('.')[0]  }`;
    }
}
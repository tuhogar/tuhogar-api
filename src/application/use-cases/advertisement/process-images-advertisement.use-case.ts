import { Injectable } from '@nestjs/common';
import { AdvertisementPhoto, AdvertisementStatus } from 'src/domain/entities/advertisement';
import { v4 as uuidv4 } from 'uuid';
import { AlgoliaService } from 'src/infraestructure/algolia/algolia.service';
import { UploadImagesAdvertisementDto } from 'src/infraestructure/http/dtos/advertisement/upload-images-advertisement.dto';
import { CloudinaryService } from 'src/infraestructure/cloudinary/cloudinary.service';
import { IAdvertisementRepository } from 'src/application/interfaces/repositories/advertisement.repository.interface';

@Injectable()
export class ProcessImagesAdvertisementUseCase {
    constructor(
        private readonly algoliaService: AlgoliaService,
        private readonly cloudinaryService: CloudinaryService,
        private readonly advertisementRepository: IAdvertisementRepository,
    ) {}

    async execute(accountId: string, advertisementId: string, uploadImagesAdvertisementDto: UploadImagesAdvertisementDto): Promise<void> {
        const advertisement = await this.advertisementRepository.findOneById(advertisementId);
        if (!advertisement) throw new Error('notfound.advertisement.do.not.exists');

        if (accountId !== advertisement.accountId) {
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
        
            const imageUrl = await this.cloudinaryService.uploadBase64Image(imageContent, 'image/webp', imageName, 'advertisements');
            const imageUrlStr = imageUrl.toString().replace('http://', 'https://')
            //await this.cloudinaryService.uploadImageBuffer(thumbnailBuffer, image.contentType, imageThumbnailName);
            const imageThumbnailUrl = imageUrlStr.replace('upload/', 'upload/c_thumb,w_352,h_352,g_face/');

            newPhotos.push({
                id: randomId,
                name: imageUrlStr.split('/')[imageUrlStr.split('/').length-1],
                url: imageUrlStr,
                thumbnailUrl: imageThumbnailUrl,
                order: image.order,
            });
        }

        const updatedAdvertisement = await this.advertisementRepository.createPhotos(accountId, advertisementId, newPhotos, AdvertisementStatus.WAITING_FOR_APPROVAL);

        if (!updatedAdvertisement) throw new Error('notfound.advertisement.do.not.exists');

        await this.algoliaService.delete(updatedAdvertisement.id);
    }

    private getPublicIdFromImageUrl(imageUrl: string): string {
        const split = imageUrl.split('/');
        return `${split[split.length-2]}/${split[split.length-1].split('.')[0]  }`;
    }
}